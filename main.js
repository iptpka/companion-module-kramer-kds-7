import { InstanceBase, Regex, runEntrypoint, InstanceStatus, TCPHelper } from '@companion-module/base'
import { default as UpgradeScripts } from './upgrades.js'
import { getActionDefinitions } from './actions.js'
import { getFeedBackDefinitions } from './feedbacks.js'
import { getVariableDefinitions } from './variables.js'
import { ConfigFields } from './config.js'

class KDS7Instance extends InstanceBase {

	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config

		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions

		this.init_tcp()
	}

	init_tcp() {
		if (this.socket) {
			this.socket.destroy()
			delete this.socket
		}

		this.updateStatus(InstanceStatus.Connecting)

		if (this.config.host) {
			this.socket = new TCPHelper(this.config.host, this.config.port)

			this.socket.on('status_change', (status, message) => {
				this.updateStatus(status, message)
			})

			this.socket.on('error', (err) => {
				this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
				console.log('error', 'Network error: ' + err.message)
			})

			this.socket.on('data', (data) => {
				let dataResponse = data.toString()
				console.log('Data response:', dataResponse)
				this.setVariableValues({ tcp_response: dataResponse })
			})
		} else {
			this.updateStatus(InstanceStatus.BadConfig)
		}
	}


	// When module gets deleted
	async destroy() {
		if (this.socket !== undefined) {
			this.socket.destroy()
			delete this.socket
		}
	}

	async configUpdated(config) {
		this.config = config
	}

	// Return config fields for web config
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
