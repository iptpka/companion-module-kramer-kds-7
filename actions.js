import { PROTOCOL3000COMMANDS } from './constants.js'

export function getActionDefinitions (self) {
	if (!self.config.port) return {}

	function deviceChoiceArray (sockets) {
		return [...Array(sockets.length).keys()].map((x) => (x = { id: x.toString(), label: Number(++x).toString() }))
	}
	const encoderChoices = deviceChoiceArray(self.encoderSockets)
	const decoderChoices = deviceChoiceArray(self.decoderSockets)
	const encoderDefault = encoderChoices.at(0).id
	const decoderDefault = decoderChoices.at(0).id

	let actions = {
		send_command: {
			name: 'Send Protocol 3000 Command',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value:
						'Send a Protocol 3000 command to a single device. Commands are automatically prefixed & suffixed accordingly, you only need the command name and parameters.',
					width: 12
				},
				{
					type: 'checkbox',
					id: 'freeinput',
					label: 'Free input',
					default: false,
					width: 12
				},
				{
					id: 'commandselect',
					type: 'dropdown',
					label: 'Command',
					choices: PROTOCOL3000COMMANDS,
					default: '#',
					isVisible: (options) => !options.freeinput
				},
				{
					id: 'parameters',
					type: 'textinput',
					label: 'Parameters',
					default: '',
					useVariables: true,
					width: 12,
					isVisibleData: PROTOCOL3000COMMANDS,
					isVisible: (options, commands) => !options.freeinput // && commands.filter((command) => command.id == options.commandselect).at(0).parameters !== null)
				},
				{
					id: 'command',
					type: 'textinput',
					label: 'Command and parameters',
					default: '',
					useVariables: true,
					width: 12,
					isVisible: (options) => options.freeinput
				},
				{
					id: 'devicetype',
					type: 'dropdown',
					label: 'Device type',
					choices: [
						{ id: 'encoder', label: 'Encoder' },
						{ id: 'decoder', label: 'Decoder' }
					],
					default: 'encoder'
				},
				{
					id: 'encoder',
					type: 'dropdown',
					label: 'Encoder number',
					choices: encoderChoices,
					default: encoderDefault,
					isVisible: (options) => options.devicetype === 'encoder'
				},
				{
					id: 'decoder',
					type: 'dropdown',
					label: 'Decoder number',
					choices: decoderChoices,
					default: decoderDefault,
					isVisible: (options) => options.devicetype === 'decoder'
				}
			],
			callback: async (action) => {
				if (!self.config.port) return
				const options = action.options
				const cmdContent = options.freeinput
					? `#${options.command}\r`
					: `${options.commandselect} ${options.parameters}\r`
				const cmd = await self.parseVariablesInString(cmdContent)
				const sockets = options.devicetype == 'encoder' ? self.encoderSockets : self.decoderSockets
				const deviceNumber = options.devicetype == 'encoder' ? options.encoder : options.decoder
				if (sockets !== undefined && sockets.at(parseInt(deviceNumber)).isConnected) {
					let socket = sockets.at(parseInt(deviceNumber))
					console.log(`Sending command to ${socket.label}:`, cmd)
					socket.send(cmd)
				} else {
					console.log('Socket not connected!')
				}
			}
		},
		broadcast_command: {
			name: 'Broadcast Protocol 3000 Command',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value:
						'Broadcast a Protocol 3000 command to all connected devices of selected type. Commands are automatically prefixed & suffixed accordingly, you only need the command name and parameters.',
					width: 12
				},
				{
					type: 'checkbox',
					id: 'freeinput',
					label: 'Free input',
					default: false,
					width: 12
				},
				{
					id: 'commandselect',
					type: 'dropdown',
					label: 'Command',
					choices: PROTOCOL3000COMMANDS,
					default: '#',
					isVisible: (options) => !options.freeinput
				},
				{
					id: 'parameters',
					type: 'textinput',
					label: 'Parameters',
					default: '',
					useVariables: true,
					width: 12,
					isVisibleData: PROTOCOL3000COMMANDS,
					isVisible: (options, data) => !options.freeinput // && data.filter((entry) => entry.id == options.commandselect).at(0).parameters !== null)
				},
				{
					id: 'command',
					type: 'textinput',
					label: 'Command and parameters',
					default: '',
					useVariables: true,
					width: 12,
					isVisible: (options) => options.freeinput
				},
				{
					id: 'devicetype',
					type: 'dropdown',
					label: 'Device type',
					choices: [
						{ id: 'encoder', label: 'Encoder' },
						{ id: 'decoder', label: 'Decoder' }
					],
					default: 'encoder'
				}
			],
			callback: async (action) => {
				if (!self.config.port) return
				const options = action.options
				const cmdContent = options.freeinput
					? `#${options.command}\r`
					: `${options.commandselect} ${options.parameters}\r`
				const cmd = await self.parseVariablesInString(cmdContent)
				const sockets = options.devicetype == 'encoder' ? self.encoderSockets : self.decoderSockets
				console.log(`Broadcasting to all ${options.devicetype}s command:`, cmd)
				sockets.forEach((socket) => {
					if (!socket.isConnected) {
						console.log(`Socket for ${socket.label} not connected!`)
						return
					}
					socket.send(cmd)
				})
			}
		}
	}

	if (self.config.videowall) {
		function subsetChoiceArray () {
			if (self.videowall === undefined) return [{ id: '0', label: 'video wall undefined' }]
			const subsets = self.videowall.subsets
			return [...Array(self.videowall.subsets.length).keys()].map((x) => {
				const subset = subsets.at(x)
				return { id: subset.id, label: `${subset.id}: ${subset.elements.length} elements` }
			})
		}
		const subsetChoices = subsetChoiceArray()
		const defaultSubset = subsetChoices.at(0).id
		actions.subset_multicast = {
			name: 'Multicast Protocol 3000 Command to Subset',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value:
						'Multicast a Protocol 3000 command to all decoders in selected video wall subset. Commands are automatically prefixed & suffixed accordingly, you only need the command name and parameters.',
					width: 12
				},
				{
					type: 'checkbox',
					id: 'freeinput',
					label: 'Free input',
					default: false,
					width: 12
				},
				{
					id: 'commandselect',
					type: 'dropdown',
					label: 'Command',
					choices: PROTOCOL3000COMMANDS,
					default: '#',
					isVisible: (options) => !options.freeinput
				},
				{
					id: 'parameters',
					type: 'textinput',
					label: 'Parameters',
					default: '',
					useVariables: true,
					width: 12,
					isVisibleData: PROTOCOL3000COMMANDS,
					isVisible: (options, data) => !options.freeinput // && data.filter((entry) => entry.id == options.commandselect).at(0).parameters !== null)
				},
				{
					id: 'command',
					type: 'textinput',
					label: 'Command and parameters',
					default: '',
					useVariables: true,
					width: 12,
					isVisible: (options) => options.freeinput
				},
				{
					id: 'subsetselect',
					type: 'dropdown',
					label: 'Subset',
					choices: subsetChoices,
					default: defaultSubset
				}
			],
			callback: async (action) => {
				const options = action.options
				if (!self.config.port || options.subsetselect === undefined) return
				const cmdContent = options.freeinput
					? `#${options.command}\r`
					: `${options.commandselect} ${options.parameters}\r`
				const cmd = await self.parseVariablesInString(cmdContent)
				const subset = self.videowall.subsets.find((subset) => subset.id === options.subsetselect)
				console.log(`Multicasting to all decoders in subset ${subset.id} command:`, cmd)

				subset.elements.forEach((element) => {
					const socket = self.decoderSockets.find((socket) => socket.id === element.index + 1)
					if (!socket.isConnected) {
						console.log(`Socket for ${socket.label} not connected!`)
						return
					}
					socket.send(cmd)
				})
			}
		}
		actions.add_to_subset = {
			name: 'Add Decoder to Subset',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value:
						"Add a decoder to a subset of the module's internal video wall model. This action does NOT send any commands by itself.",
					width: 12
				},
				{
					id: 'subsetselect',
					type: 'dropdown',
					label: 'Subset',
					choices: subsetChoices,
					default: defaultSubset
				},
				{
					id: 'decoder',
					type: 'dropdown',
					label: 'Decoder number',
					choices: decoderChoices,
					default: decoderDefault
				}
			],
			callback: async (action) => {
				console.log(decoderChoices)
				const options = action.options
				if (!self.config.port || options.subsetselect === undefined) return
				const subset = self.videowall.subsets.find((subset) => subset.id === options.subsetselect)
				subset.addElement(this.videowall.elements.find((element) => element.index === decoder))
				self.videowall.removeEmptySubsets()
			}
		}
	}
	return actions
}
