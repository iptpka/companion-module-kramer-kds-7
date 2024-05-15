import { PROTOCOL3000COMMANDS } from './constants.js'

export function getActionDefinitions (self) {
	if (!self.config.port) return {}
	
	function deviceChoiceArray(sockets) {
		return [...Array(sockets.length).keys()].map((x) => x = {id: x.toString(), label: Number(++x).toString()})
	}
	
	function firstId(choices) { return choices.at(0).id }
	const encoderChoices = deviceChoiceArray(self.encoderSockets)
	const decoderChoices = deviceChoiceArray(self.decoderSockets)

	return {
		send_command: {
			name: 'Send Protocol 3000 Command',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value: 'Send a protocol 3000 command to a single device. Commands are automatically prefixed & suffixed accordingly, you only need the command name and parameters.',
					width: 12,
				},
				{
					type: 'checkbox',
					id: 'freeinput',
					label: 'Free input',
					default: false,
					width: 12,
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
					//is visible only for commands that have parameters
					//isVisible: ((options, commands) => !options.freeinput && commands.filter((command) => command.id == options.commandselect).at(0).parameters !== null)
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
						{ id: 'decoder', label: 'Decoder' },
					],
					default: 'encoder',
				},
				{
					id: 'encoder',
					type: 'dropdown',
					label: 'Encoder number',
					choices: encoderChoices,
					default: firstId(encoderChoices),
					isVisible: (options) => options.devicetype === 'encoder'
				},
				{
					id: 'decoder',
					type: 'dropdown',
					label: 'Decoder number',
					choices: decoderChoices,
					default: firstId(decoderChoices),
					isVisible: (options) => options.devicetype === 'decoder'
				},
			],
			callback: async (action) => {
				if (!self.config.port) return
				let options = action.options
				const cmdContent = options.freeinput ? `#${options.command}\r` : `${options.commandselect} ${options.parameters}\r`
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
			},
		},
		broadcast_command: {
			name: 'Broadcast Protocol 3000 Command',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value: 'Broadcast a protocol 3000 command to all connected devices of selected type. Commands are automatically prefixed & suffixed accordingly, you only need the command name and parameters.',
					width: 12,
				},
				{
					type: 'checkbox',
					id: 'freeinput',
					label: 'Free input',
					default: false,
					width: 12,
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
					//isVisible: ((options, data) => !options.freeinput && data.filter((entry) => entry.id == options.commandselect).at(0).parameters !== null)
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
						{ id: 'decoder', label: 'Decoder' },
					],
					default: 'encoder',
				},
			],
			callback: async (action) => {
				if (!self.config.port) return
				let options = action.options
				const cmdContent = options.freeinput ? `#${options.command}\r` : `${options.commandselect} ${options.parameters}\r`
				const cmd = await self.parseVariablesInString(cmdContent)
				const sockets = options.devicetype == 'encoder' ? self.encoderSockets : self.decoderSockets
				console.log(`Broadcasting to all ${options.devicetype}s command:`, cmd)
				sockets.forEach(socket => {
					if (!socket.isConnected) {
						console.log(`Socket for ${socket.label} not connected!`)
						return
					}
					socket.send(cmd)
				});
			},
		},
	}

}
