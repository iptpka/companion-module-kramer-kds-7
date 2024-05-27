import { InstanceBase, runEntrypoint, InstanceStatus, TCPHelper } from '@companion-module/base'
import { default as UpgradeScripts } from './upgrades.js'
import { getActionDefinitions } from './actions.js'
import { getFeedBackDefinitions } from './feedbacks.js'
import { getVariableDefinitions } from './variables.js'
import { ConfigFields } from './config.js'
import { incrementedIP } from './utils.js'
import { VideoWall } from './videowall.js'

class KDS7Instance extends InstanceBase {
	handleDataResponse (socket, data) {
		const dataResponse = data.toString()
		if (dataResponse.length === 0) return
		this.log('debug', `Response from ${socket.label}: ${dataResponse}`)
		this.setVariableValues({ tcp_response: dataResponse })
	}

	constructor (internal) {
		super(internal)
		this.encoderSockets = []
		this.decoderSockets = []
	}

	get sockets () {
		return this.encoderSockets.concat(this.decoderSockets)
	}

	async init (config) {
		this.configUpdated(config)
		this.updateStatus(InstanceStatus.Ok)
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
	}

	createSockets (addresses, devicetype) {
		let socketArray = []
		addresses.forEach((address, i) => {
			const socket = new TCPHelper(address, this.config.port)
			socket.label = `${devicetype} ${i + 1}`
			socket.id = i + 1
			// For protocol 3000 responses
			socket.responses = {}

			socket.on('status_change', (status, message) => {
				this.updateStatus(status, message)
			})

			socket.on('error', (err) => {
				this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
				console.log('error', 'Network error: ' + err.message)
			})

			socket.on('data', (data) => this.handleDataResponse(socket, data))

			socketArray.push(socket)
		})
		return socketArray
	}

	async init_tcp () {
		this.updateStatus(InstanceStatus.Connecting)
		this.destroySockets()

		//[...Array(n).keys()] generates a number range array from 0 to n-1: [0, 1, 2, ... n-1]
		let encoderAddresses = [...Array(this.config.encoderamount).keys()].map((x) =>
			incrementedIP(this.config.encoderaddress, x)
		)
		let decoderAddresses = [...Array(this.config.decoderamount).keys()].map((x) =>
			incrementedIP(this.config.decoderaddress, x)
		)
		this.encoderSockets = this.createSockets(encoderAddresses, 'encoder')
		this.decoderSockets = this.createSockets(decoderAddresses, 'decoder')
	}

	async verifyConnections () {
		let waitForConnections = []
		this.sockets.forEach((socket) => {
			const statusPromise = {}
			statusPromise.promise = new Promise((res, rej) => {
				statusPromise.resolve = res
				statusPromise.reject = rej
			})
			socket.removeAllListeners('status_change')
			socket.on('status_change', (status, message) => {
				if (status === InstanceStatus.Ok) {
					statusPromise.resolve([status, message])
				} else if (status === InstanceStatus.ConnectionFailure || status === InstanceStatus.UnknownError) {
					this.updateStatus(status)
					statusPromise.reject(new Error(message))
				}
				socket.removeAllListeners('status_change')
				socket.on('status_change', (status, message) => {
					this.updateStatus(status, message)
				})
			})
			waitForConnections.push(statusPromise.promise)
		})
		await Promise.all(waitForConnections).catch((error) => {
			this.log('error', error)
		})
	}

	async protocol3000Handshake () {
		const handshakeResponses = this.sockets.map((socket) => {
			return this.protocolQuery(socket, ['#\r'], (_, data, responsePromise) => {
				const dataResponse = data.toString()
				if (dataResponse.includes('OK')) {
					responsePromise.resolve()
					return true
				}
				return false
			})
		})
		const timeout = new Promise((_, reject) => {
			setTimeout(reject, 6000, new Error('Protocol3000 handshake timeout!'))
		})

		await Promise.race([Promise.all(handshakeResponses), timeout])
			.then(() => {
				this.updateStatus('ok')
				this.log('debug', 'All KDS devices connected')
			})
			.catch((error) => {
				this.log('error', error.toString())
			})
	}

	async queryChannelIds () {
		const channelIdQueries = this.encoderSockets.map((socket) => {
			return this.protocolQuery(socket, ['#KDS-DEFINE-CHANNEL?\r'], (socket, data, responsePromise) => {
				const dataResponse = data.toString()
				if (!dataResponse.includes('KDS-DEFINE-CHANNEL')) {
					return false
				}
				socket.channelId = parseInt(dataResponse.slice(dataResponse.indexOf(' '), dataResponse.indexOf('\r')))
				responsePromise.resolve()
				return true
			})
		})

		return Promise.all(channelIdQueries)
	}

	destroySockets () {
		this.encoderSockets.forEach((socket) => {
			if (socket !== undefined) {
				socket.destroy()
			}
		})
		this.decoderSockets.forEach((socket) => {
			if (socket !== undefined) {
				socket.destroy()
			}
		})
		this.encoderSockets.length = this.decoderSockets.length = 0
	}

	async destroy () {
		this.destroySockets()
	}

	/**
	 * Queries all the decoders for their VIDEO-WALL-SETUP and VIEW-MOD values
	 * to determine how the video wall is partitioned into different views
	 * and builds a matching VideoWall instance.
	 */
	async updateVideoWallConfig () {
		const rows = this.config.videowallrows
		const columns = this.config.videowallcolumns

		if (this.config.decoderamount != rows * columns) {
			this.updateStatus(InstanceStatus.BadConfig)
			console.log("Bad videowall config! Rows and columns don't match the amount of decoder devices.")
			return
		}

		this.videowall = new VideoWall(rows, columns)

		const dimensionQueries = this.decoderSockets.map((socket) => {
			return this.protocolQuery(socket, ['#VIEW-MOD?\r', '#VIDEO-WALL-SETUP?\r'], (socket, data, responsePromise) => {
				for (const dataResponse of data.toString().split('\n')) {
					if (!(dataResponse.includes('VIEW-MOD') || dataResponse.includes('VIDEO-WALL-SETUP'))) {
						continue
					}
					const response = dataResponse
						.slice(dataResponse.indexOf('@') + 1)
						.replace('\r\n', '')
						.split(' ')
					socket.responses[response[0]] = response[1]
					if (Object.keys(socket.responses).length === 2) {
						const responses = socket.responses
						socket.responses = {}
						responsePromise.resolve({ [socket.id]: responses })
						return true
					}
				}
				return false
			})
		})
		/* Determines the amount of separate areas/subsets in the video wall.
		 * Each new set of dimension values in a VIEW-MOD response from a decoder is a new subset.
		 * If a subset already exists for a certain set of dimensions, check if that subset already contains
		 * the current decoders VIDEO-WALL-SETUP outputId value. If not, add the decoder to that set, else make a new subset for it.
		 */
		await Promise.all(dimensionQueries).then((socketResponses) => {
			let subsets = {}
			socketResponses.forEach((socketResponse) => {
				const [socketId, responses] = Object.entries(socketResponse).flat()
				const dimensions = responses['VIEW-MOD']
				function key (increment) {
					return `${dimensions} + ${increment}`
				}
				const outputId = responses['VIDEO-WALL-SETUP'].split(',')[0]
				let i = 0
				while (true) {
					// New subset containing this decoder
					if (subsets[key(i)] === undefined) {
						subsets[key(i)] = { [outputId]: socketId }
						break
					}
					// New outputId for subset
					if (subsets[key(i)][outputId] === undefined) {
						subsets[key(i)][outputId] = socketId
						break
					}
					// Key existed for this socket's outputId so it must belong to another subset with same dimensions
					i++
				}
			})

			// Generate a new video wall subset for each unique area detected and add all its elements to it.
			Object.values(subsets).forEach((IdPairs) => {
				const subset = this.videowall.addSubset()
				Object.values(IdPairs).forEach((socketId) => {
					subset.addElement(this.videowall.elements.find((element) => element.index === socketId - 1))
				})
			})
			this.videowall.removeEmptySubsets()
		})

		this.setVariableValues({ selected_subset: this.videowall.subsets.at(0).id })
	}

	/**
	 * @typedef {Object} PromiseWithResolvers
	 * @property {Promise} promise - The promise object
	 * @property {function} resolve - The promise's resolve function
	 * @property {function} reject - The promise's reject function
	 */
	/**
	 * Sends a protocol3000 command and returns the response promise that gets bound to the socket.
	 * The promise should be resolved/rejected in onResponseCallback with 'responsePromise.resolve(message)'.
	 * @see {@link queryChannelIds} for an example of use
	 * @param {TCPHelper} socket - The sending socket, the references to the resolve and reject functions get bound to this.
	 * @param {string[]} messages - The messages to send.
	 * @param {(socket: TCPHelper, data: Buffer, responsePromise: PromiseWithResolvers) => boolean} onResponseCallback - Function for parsing the response and resolving the promise. Return true on resolve to clean up socket.
	 * @returns {Promise<any>}
	 * @todo Make this easier to understand if possible, currently feels very hacky and probably breaks all sorts of conventions.
	 */
	async protocolQuery (socket, messages, onResponseCallback) {
		socket.removeAllListeners('data')
		const responsePromise = {}
		responsePromise.promise = new Promise((res, rej) => {
			responsePromise.resolve = res
			responsePromise.reject = rej
		})

		socket.on('data', (data) => {
			if (onResponseCallback(socket, data, responsePromise)) {
				socket.removeAllListeners('data')
				socket.on('data', (data) => this.handleDataResponse(socket, data))
			}
		})
		messages.forEach((message) => {
			socket.send(message)
		})
		return responsePromise.promise
	}

	async configUpdated (config) {
		if (config.port === undefined) {
			this.updateStatus(InstanceStatus.BadConfig)
			return
		}
		this.config = config
		this.init_tcp()
		this.updateVariableDefinitions()
		await this.verifyConnections()
		await this.protocol3000Handshake()
		this.queryChannelIds().then(() => {
			this.setVariableValues({ selected_channel: this.encoderSockets.at(0).channelId })
		})
		if (config.videowall) {
			await this.updateVideoWallConfig()
		}
		this.updateActions()
	}

	getConfigFields () {
		return ConfigFields
	}

	updateActions () {
		this.setActionDefinitions(getActionDefinitions(this))
	}

	updateFeedbacks () {
		this.setFeedbackDefinitions(getFeedBackDefinitions(this))
	}

	updateVariableDefinitions () {
		this.setVariableDefinitions(getVariableDefinitions(this))
	}
}

runEntrypoint(KDS7Instance, UpgradeScripts)
