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
			console.log(`Response from ${socket.label}:`, dataResponse)
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
			socket.label = `${devicetype}${i + 1}`
			socket.id = i + 1

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
			socket.statusOk = {}
			socket.statusOk.promise = new Promise((resolve, reject) => {
				socket.statusOk.resolve = resolve
				socket.statusOk.reject = reject
			})
			socket.removeAllListeners('status_change')
			socket.on('status_change', (status, message) => {
				this.updateStatus(status, message)
				if (status === 'ok') {
					socket.statusOk.resolve([status, message])
				}
			})
			waitForConnections.push(socket.statusOk.promise)
		})
		await Promise.all(waitForConnections).then(() => {
			console.log('All KDS devices connected')
			this.sockets.forEach((socket) => {
				delete socket.statusOk
				socket.removeAllListeners('status_change')
				socket.on('status_change', (status, message) => {
					this.updateStatus(status, message)
				})
			})
		})
	}

	//This should probably be converted to a generic method for querying with a promise.
	async queryChannelIds () {
		let waitForResponses = []
		this.encoderSockets.forEach((socket) => {
			socket.removeAllListeners('data')
			socket.responseWaiter = {}

			socket.responseWaiter.promise = new Promise((resolve, reject) => {
				socket.responseWaiter.resolve = resolve
				socket.responseWaiter.reject = reject
			})

			waitForResponses.push(socket.responseWaiter.promise)

			socket.on('data', (data) => {
				if (!data.toString().includes('KDS-DEFINE-CHANNEL')) {
					return
				}
				const dataResponse = data.toString()
				socket.channelId = parseInt(dataResponse.slice(dataResponse.indexOf(' '), dataResponse.indexOf('\r')))
				socket.responseWaiter.resolve()
			})

			socket.send('#KDS-DEFINE-CHANNEL?\r')
		})

		await Promise.all(waitForResponses)

		// Clean up encoder sockets
		this.encoderSockets.forEach((socket) => {
			delete socket.responseWaiter
			socket.removeAllListeners('data')
			socket.on('data', (data) => this.handleDataResponse(socket, data))
		})
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
		this.encoderSockets.length = this.decoderSockets = 0
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

		/* Query the area dimensions and outputIds from all decoders to determine how the video wall
		 * is partitioned.
		 */
		let waitForResponses = []
		this.decoderSockets.forEach((socket) => {
			socket.removeAllListeners('data')
			socket.responseWaiter = {}
			socket.responses = {}

			socket.responseWaiter.promise = new Promise((resolve, reject) => {
				socket.responseWaiter.resolve = resolve
				socket.responseWaiter.reject = reject
			})

			waitForResponses.push(socket.responseWaiter.promise)

			socket.on('data', (data) => {
				if (!(data.toString().includes('VIEW-MOD') || data.toString().includes('VIDEO-WALL-SETUP'))) {
					return
				}
				const dataResponse = data
					.toString()
					.slice(data.toString().indexOf('@') + 1)
					.replace('\r\n', '')
				const response = dataResponse.split(' ')
				socket.responses[response[0]] = response[1]
				if (Object.keys(socket.responses).length === 2) {
					socket.responseWaiter.resolve({ [socket.id]: socket.responses })
				}
			})

			socket.send('#VIEW-MOD?\r')
			socket.send('#VIDEO-WALL-SETUP?\r')
		})
		/* Determines the amount of separate areas/subsets in the video wall.
		 * Each new set of dimension values in a VIEW-MOD response from a decoder is a new subset.
		 * If a subset already exists for a certain set of dimensions, check if that subset already contains
		 * the current decoders VIDEO-WALL-SETUP outputId value. If not, add the decoder to that set, else make a new subset for it.
		 */
		await Promise.all(waitForResponses).then((socketResponseArray) => {
			let subsets = {}
			socketResponseArray.forEach((socketResponse) => {
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
		// Clean up all the sockets.
		this.decoderSockets.forEach((socket) => {
			delete socket.responses
			delete socket.responseWaiter
			socket.removeAllListeners('data')
			socket.on('data', (data) => this.handleDataResponse(socket, data))
		})

		this.setVariableValues({ selected_subset: this.videowall.subsets.at(0).id })
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
		await this.queryChannelIds()
		this.setVariableValues({ selected_channel: this.encoderSockets.at(0).channelId })
		if (config.videowall) {
			
			this.updateVideoWallConfig()
		}
		this.updateActions()
	}

	getConfigFields () {
		return ConfigFields
	}

	init_tcp_variables () {
		this.setVariableDefinitions([{ name: 'Last TCP Response', variableId: 'tcp_response' }])

		this.setVariableValues({ tcp_response: '' })
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
