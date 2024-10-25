import { InstanceBase, runEntrypoint, InstanceStatus, TCPHelper } from '@companion-module/base'
import { default as UpgradeScripts } from './upgrades.js'
import { getActionDefinitions } from './actions.js'
import { getFeedBackDefinitions } from './feedbacks.js'
import { getVariableDefinitions } from './variables.js'
import { ConfigFields } from './config.js'
import { incrementedIP, promiseAllOrTimeout } from './utils.js'
import { VideoWall } from './videowall.js'

class KDS7Instance extends InstanceBase {
	async handleDataResponse(socket, data) {
		const dataResponse = data.toString()
		// Workaround for weird empty data, the buffer probably doesn't get cleared properly sometimes
		if (dataResponse.length === 0) return
		this.log(socket.logAsInfo ? 'info' : 'debug', `KDS ${socket.label}: ${dataResponse}`)
	}

	constructor(internal) {
		super(internal)
		this.encoderSockets = []
		this.decoderSockets = []
		this.configOk = false
	}

	get sockets() {
		return this.encoderSockets.concat(this.decoderSockets)
	}

	async init(config) {
		this.updateStatus(InstanceStatus.Disconnected)
		this.config = config
		this.configOk = this.validateConfig(config)
		this.createConnections()
	}

	validateConfig(config) {
		return config !== undefined && config.port != '' && config.encoderaddress != '' && config.decoderaddress != ''
	}

	createSockets(addresses, devicetype) {
		return addresses.map((address, i) => {
			const socket = new TCPHelper(address, this.config.port)
			socket.label = `${devicetype} ${i + 1}`
			socket.id = i + 1
			//false by default so console doesn't get spammed while connecting
			socket.logAsInfo = false

			socket.on('error', (err) => {
				this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
				console.log('error', 'Network error: ' + err.message)
			})

			socket.on('data', (data) => this.handleDataResponse(socket, data))
			return socket
		})
	}

	createAddressRange(start, size) {
		return [...Array(size).keys()].map((x) => incrementedIP(start, x))
	}

	async initTCP() {
		this.destroySockets()

		const encoderAddresses = this.createAddressRange(this.config.encoderaddress, this.config.encoderamount)
		const decoderAddresses = this.createAddressRange(this.config.decoderaddress, this.config.decoderamount)
		this.decoderSockets = this.createSockets(decoderAddresses, 'decoder')
		this.encoderSockets = this.createSockets(encoderAddresses, 'encoder')
	}

	async verifyConnections() {
		let waitForConnections = []
		this.sockets.forEach((socket) => {
			const statusPromise = {}
			statusPromise.promise = new Promise((res, rej) => {
				statusPromise.resolve = res
				statusPromise.reject = rej
			})
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

	async protocol3000Handshake() {
		const handshakes = this.sockets.map((socket) => {
			return this.protocolQuery(socket, '#\r', (_, response, responsePromise) => {
				if (response.includes('OK')) {
					responsePromise.resolve()
					return true
				}
				return false
			})
		})

		return promiseAllOrTimeout(handshakes, 5000, 'KDS handshake timeout!').then(() => {
			this.updateStatus('ok')
			this.log('debug', 'All KDS devices connected')
		})
	}

	async queryChannelIds() {
		const channelIdQueries = this.encoderSockets.map((socket) => {
			return this.protocolQuery(
				socket,
				'#KDS-DEFINE-CHANNEL?\r',
				this.simpleP3KResponseResolver(this, 'KDS-DEFINE-CHANNEL')
			)
		})

		return promiseAllOrTimeout(channelIdQueries, 5000, 'Channel query timeout!')
			.then((queryResponses) => {
				new Map(queryResponses).forEach((response, encoderSocket) => {
					encoderSocket.channelId = parseInt(response.parameters)
				})
			})
			.catch((error) => {
				this.log('error', error.message)
			})
	}

	async destroySockets() {
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

	async destroy() {
		this.destroySockets()
		if (this.videowall) {
			delete this.videowall
		}
	}

	parseResponse(dataResponse) {
		const responseArray = dataResponse
			.slice(dataResponse.indexOf('@') + 1)
			.trimEnd()
			.split(' ')
		return { command: responseArray[0], parameters: responseArray[1] }
	}

	simpleP3KResponseResolver(self, validationString) {
		return function (socket, response, responsePromise) {
			if (!response.includes(validationString)) {
				if (response.includes('ERR')) {
					responsePromise.reject(new Error(`Protocol3000 error: ${response}`))
				}
				return false
			}
			responsePromise.resolve([socket, self.parseResponse(response)])
			return true
		}
	}

	/**
	 * Queries all the decoders for their VIDEO-WALL-SETUP and VIEW-MOD values
	 * to determine how the video wall is partitioned into different views
	 * and builds a matching Videowall instance.
	 */
	async queryVideoWallPartitioning() {
		let queries = []
		this.decoderSockets.forEach((socket) => {
			queries.push(
				this.protocolQuery(socket, '#VIDEO-WALL-SETUP?\r', this.simpleP3KResponseResolver(this, 'VIDEO-WALL-SETUP'))
			)
			queries.push(this.protocolQuery(socket, '#VIEW-MOD?\r', this.simpleP3KResponseResolver(this, 'VIEW-MOD')))
		})
		return promiseAllOrTimeout(queries, 5000, 'Video Wall query timeout!')
	}

	async queryChannelsInUse() {
		let queries = []
		this.videowall.areas.forEach((area) => {
			const socket = this.decoderSockets.find((socket) => socket.id === area.elements.at(0).index + 1)
			queries.push(
				this.protocolQuery(
					socket,
					'#KDS-CHANNEL-SELECT? video\r',
					this.simpleP3KResponseResolver(this, 'KDS-CHANNEL-SELECT')
				)
			)
		})
		return promiseAllOrTimeout(queries, 5000, 'Video wall channel in use query timeout!')
	}

	async updateVideoWall() {
		const rows = this.config.videowallrows
		const columns = this.config.videowallcolumns

		if (this.config.decoderamount != rows * columns) {
			this.updateStatus(InstanceStatus.BadConfig)
			console.log("Bad videowall config! Rows and columns don't match the amount of decoder devices.")
			return
		}
		let defaultChannel = this.config.defaultchannel
		if (!this.encoderSockets.some((encoder) => encoder.channelId === defaultChannel)) {
			defaultChannel = this.encoderSockets.at(0).channelId
			this.log('warn', `No encoder matching "Default channel" ${this.config.defaultchannel} set in the configuration!`)
			this.log('warn', `Setting default channel as ${defaultChannel}`)
		}
		this.videowall = new VideoWall(rows, columns, defaultChannel)

		/* Determines the amount of separate areas in the video wall.
		 * Each new set of dimension values in a VIEW-MOD response from a decoder is a new area.
		 * If a area already exists for a certain set of dimensions, check if that area already contains
		 * the current decoder's VIDEO-WALL-SETUP outputId value. If not, add the decoder to that set, else make a new area for it.
		 */
		await this.queryVideoWallPartitioning()
			.then((queryResponses) => {
				const mergedResponses = new Map()
				queryResponses.forEach((queryResponse) => {
					const socketId = queryResponse[0].id
					const response = queryResponse[1]
					if (!mergedResponses.has(socketId)) {
						mergedResponses.set(socketId, new Map([[response.command, response.parameters]]))
					} else {
						mergedResponses.get(socketId).set(response.command, response.parameters)
					}
				})
				const viewAreas = new Map()
				mergedResponses.forEach((responses, socketId) => {
					const layout = responses.get('VIEW-MOD')
					const outputId = responses.get('VIDEO-WALL-SETUP').split(',')[0]
					let i = 0
					while (true) {
						const areaName = `${layout} + ${i}`
						if (!viewAreas.has(areaName)) {
							// New area
							viewAreas.set(areaName, new Map([[outputId, socketId]]))
							break
						}
						if (!viewAreas.get(areaName).has(outputId)) {
							// New decoder in area
							viewAreas.get(areaName).set(outputId, socketId)
							break
						}
						// Area with this layout existed and already had a decoder with this outputId,
						// so this decoder must be part of another area
						i++
					}
				})
				// Generate a new video wall area for each unique area detected and add all of its elements to it.
				viewAreas.forEach((IdPair) => {
					const area = this.videowall.addArea()
					IdPair.forEach((socketId) => {
						area.addElement(this.videowall.elements.find((element) => element.index === socketId - 1))
					})
				})
				this.videowall.removeEmptyAreas()
			})
			.catch((error) => {
				this.log('error', error.message)
			})
			
		return this.queryChannelsInUse().then(async (queryResponses) => {
			queryResponses.forEach(async (queryResponse) => {
				try {
					const socketId = queryResponse[0].id
					const channelId = parseInt(queryResponse[1].parameters.split(',')[1])
					const area = this.videowall.elements.find((element) => element.index === socketId - 1).owner
					area.channel = channelId
					this.log('warn', `${area.channel}`)
				} catch (error) {
					this.log('error', error.message)
				}


			})
		}).catch((error) => {
			this.log('error', error.message)
		})
	}

	/**
	 * @typedef {Object} PromiseWithResolvers
	 * @property {Promise} promise - The promise object
	 * @property {function} resolve - The promise's resolve function
	 * @property {function} reject - The promise's reject function
	 */
	/**
	 * Sends a protocol3000 command and returns a response promise object with resolvers.
	 * The promise should be resolved/rejected in onResponseCallback with 'responsePromise.resolve(message)'.
	 * @see {@link queryChannelIds} for an example of use
	 * @param {TCPHelper} socket - The sending socket, the references to the resolve and reject functions get bound to this.
	 * @param {string[]} messages - The messages to send.
	 * @param {(socket: TCPHelper, dataResponse: string, responsePromise: PromiseWithResolvers) => boolean} onResponseCallback - Function for parsing the response and resolving the promise. Return true on resolve to clean up socket.
	 * @returns {Promise<any>}
	 * @todo Make this easier to understand if possible, currently feels very hacky and probably breaks all sorts of conventions.
	 */
	async protocolQuery(socket, message, onResponseCallback) {
		const responsePromise = {}
		responsePromise.promise = new Promise((res, rej) => {
			responsePromise.resolve = res
			responsePromise.reject = rej
		})
		const responseListener = (data) => {
			data
				.toString()
				.split('\n')
				.forEach((dataResponse) => {
					if (onResponseCallback(socket, dataResponse, responsePromise)) {
						socket.removeListener('data', responseListener)
					}
				})
		}
		socket.on('data', responseListener)
		socket.send(message)
		return responsePromise.promise
	}

	async createConnections() {
		if (!this.configOk) {
			return
		}

		this.updateStatus(InstanceStatus.Connecting)
		this.initTCP()
		this.updateVariableDefinitions()
		try {
			await this.verifyConnections()
			await this.protocol3000Handshake()
			await this.queryChannelIds()
			await this.updateVideoWall()
			this.updateVariables()
			this.updateActions()
			this.updateFeedbacks()
			this.sockets.forEach((socket) => {
				socket.logAsInfo = true
			})
		} catch (error) {
			this.log('error', error.message)
		}
	}

	checkConfigChanged(config) {
		for (const key of Object.keys(config)) {
			if (this.config[key] !== config[key]) return false
		}
		return true
	}
	async configUpdated(config) {
		const configSame = this.checkConfigChanged(config)
		if (configSame) return
		this.configOk = this.validateConfig(config)
		this.config = config
		if (!this.configOk) {
			this.updateStatus(InstanceStatus.BadConfig)
			this.log('error', `Module ${this.label} bad config. Connection not formed.`)
			await this.destroy()
			return
		}
		this.createConnections()
	}

	getConfigFields() {
		return ConfigFields
	}

	updateActions() {
		this.setActionDefinitions(getActionDefinitions(this))
	}

	updateFeedbacks() {
		this.setFeedbackDefinitions(getFeedBackDefinitions(this))
	}

	updateVariableDefinitions() {
		this.setVariableDefinitions(getVariableDefinitions(this))
	}

	updateVariables() {
		try {
			this.setVariableValues({
				selected_channel: this.encoderSockets.at(0).channelId,
				channel_amount: this.encoderSockets.length,
				default_channel: this.config.defaultchannel,
			})
			if (this.config.videowall) {
				this.setVariableValues({
					selected_area: this.videowall.areas.at(0).id,
					area_amount: this.videowall.areas.length.toString(),
				})
			}
		} catch (error) {
			this.log('error', error.message)
		}
	}
}

runEntrypoint(KDS7Instance, UpgradeScripts)
