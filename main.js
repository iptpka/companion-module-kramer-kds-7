import { InstanceBase, runEntrypoint, InstanceStatus, TCPHelper } from '@companion-module/base'
import { default as UpgradeScripts } from './upgrades.js'
import { getActionDefinitions } from './actions.js'
import { getFeedBackDefinitions } from './feedbacks.js'
import { getVariableDefinitions } from './variables.js'
import { ConfigFields } from './config.js'
import { increaseIP } from './utils.js'
import { VideoWall } from './videowall.js'

class KDS7Instance extends InstanceBase {
	constructor (internal) {
		super(internal)
		this.encoderSockets = []
		this.decoderSockets = []
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

			socket.statusOk = {}
			socket.statusOk.promise = new Promise((resolve, reject) => {
				socket.statusOk.resolve = resolve
				socket.statusOk.reject = reject
			})

			socket.on('status_change', (status, message) => {
				this.updateStatus(status, message)
				if (status === 'ok') {
					socket.statusOk.resolve([status, message])
				}
			})

			socket.on('error', (err) => {
				this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
				console.log('error', 'Network error: ' + err.message)
			})

			socket.on('data', (data) => {
				let dataResponse = data.toString()
				console.log(`Response from ${socket.label}:`, dataResponse)
				this.setVariableValues({ tcp_response: dataResponse })
			})

			socketArray.push(socket)
		})
		return socketArray
	}

	async init_tcp () {
		if (!this.config.port) return

		this.responses = []

		this.updateStatus(InstanceStatus.Connecting)
		this.destroySockets()

		let encoderAddresses = [...Array(this.config.encoderamount).keys()].map((x) =>
			increaseIP(this.config.encoderaddress, x)
		)
		let decoderAddresses = [...Array(this.config.decoderamount).keys()].map((x) =>
			increaseIP(this.config.decoderaddress, x)
		)
		this.encoderSockets = this.createSockets(encoderAddresses, 'encoder')
		this.decoderSockets = this.createSockets(decoderAddresses, 'decoder')
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

	async updateVideoWallConfig () {
		const rows = this.config.videowallrows
		const columns = this.config.videowallcolumns

		if (this.config.decoderamount != rows * columns) {
			this.updateStatus(InstanceStatus.BadConfig)
			console.log("Bad videowall config! Rows and columns don't match the amount of decoder devices.")
			return
		}

		this.videowall = new VideoWall(rows, columns)
		const waitForConnections = this.decoderSockets.map((socket) => {
			return socket.statusOk.promise
		})

		let waitForResponses = []

		await Promise.all(waitForConnections).then((values) => {
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
						socket.responseWaiter.resolve({ id: socket.id, responses: socket.responses })
					}
				})

				socket.send('#VIEW-MOD?\r')
				socket.send('#VIDEO-WALL-SETUP?\r')
			})
		})

		Promise.all(waitForResponses).then((values) => {
			console.log(values)
			let subsets = {}
			values.forEach((value) => {
				const dimensions = value.responses['VIEW-MOD']
				const key = function (increment) {
					return increment !== undefined && increment !== 0 ? `${dimensions}+${increment}` : dimensions
				}
				const outputId = value.responses['VIDEO-WALL-SETUP'].split(',')[0]
				let i = 0
				while (true) {
					if (subsets[key(i)] === undefined) {
						subsets[key(i)] = [{ [outputId]: value.id }]
						break
					}
					if (!Object.keys(subsets[key(i)]).includes(outputId)) {
						subsets[key(i)].push({ [outputId]: value.id })
						break
					}
					i++
				}
			})

			Object.values(subsets).forEach((value) => {
				const subset = this.videowall.addSubset()
				
				value
					.map((value) => {
						return Object.values(value)
					})
					.flat()
					.forEach((id) => {
						subset.addElement(this.videowall.elements.find((element) => element.index === id - 1))
					})
			})
			this.videowall.removeEmptySubsets()
		})
	}

	async configUpdated (config) {
		this.config = config

		if (config.port === undefined) return

		this.init_tcp()
		this.updateActions()
		this.updateVariableDefinitions()

		if (config.videowall) this.updateVideoWallConfig()
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
