import { InstanceBase, runEntrypoint, InstanceStatus, TCPHelper } from '@companion-module/base'
import { default as UpgradeScripts } from './upgrades.js'
import { getActionDefinitions } from './actions.js'
import { getFeedBackDefinitions } from './feedbacks.js'
import { getVariableDefinitions } from './variables.js'
import { ConfigFields } from './config.js'
import { increaseIP } from './utils.js'

class KDS7Instance extends InstanceBase {

	constructor(internal) {
		super(internal)
		this.encoderSockets = []
		this.decoderSockets = []
	}
	
	async init(config) {
		this.configUpdated(config)
		this.updateStatus(InstanceStatus.Ok)
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
	}

	createSockets(addresses, devicetype) {
		let socketArray = []
		addresses.forEach((address, i) => {
			const socket = new TCPHelper(address, this.config.port)
			socket.label = `${devicetype}${i+1}`
			
			socket.on('status_change', (status, message) => {
				this.updateStatus(status, message)
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
		});
		return socketArray
	}

	async init_tcp() {
		if (!this.config.port) return
		
		this.updateStatus(InstanceStatus.Connecting)
		this.encoderSockets.forEach(socket => {
			if (socket) {
				socket.destroy()
			}
		});
		this.decoderSockets.forEach(socket => {
			if (socket) {
				socket.destroy()
			}
		});
		this.decoderSockets.length = this.encoderSockets.length = 0

		let encoderAddresses = [...Array(this.config.encoderamount).keys()].map((x) => increaseIP(this.config.encoderaddress, x))
		let decoderAddresses = [...Array(this.config.decoderamount).keys()].map((x) => increaseIP(this.config.decoderaddress, x))
		this.encoderSockets = this.createSockets(encoderAddresses, "encoder")
		this.decoderSockets = this.createSockets(decoderAddresses, "decoder")
	}

	async destroy() {
		this.encoderSockets.forEach(socket =>{
			if (socket !== undefined) {
				socket.destroy()
			}
		});
		this.decoderSockets.forEach(socket =>{
			if (socket !== undefined) {
				socket.destroy()
			}
		});
		this.encoderSockets.length = this.decoderSockets = 0
	}

	async configUpdated(config) {
		this.config = config
		if (config.port) {
			this.init_tcp()
			this.updateActions()
			this.updateVariableDefinitions()
		}
	}

	getConfigFields() {
		return ConfigFields
	}

	init_tcp_variables() {
		this.setVariableDefinitions([{ name: 'Last TCP Response', variableId: 'tcp_response' }])

		this.setVariableValues({ tcp_response: '' })
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
}

runEntrypoint(KDS7Instance, UpgradeScripts)
