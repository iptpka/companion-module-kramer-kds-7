export function getActionDefinitions (self) {
	function choiceArray(sockets) {
		return [...Array(sockets.length).keys()].map((x) => x = {id: x.toString(), label: Number(++x).toString()})
	}
	const encoderChoices = choiceArray(self.encoderSockets)
	const defaultEncoderChoice = encoderChoices.at(0).id
	const decoderChoices = choiceArray(self.decoderSockets)
	const defaultDecoderChoice = decoderChoices.at(0).id

	return {
		// sample_action: {
		// 	name: 'My First Action',
		// 	options: [
		// 		{
		// 			id: 'num',
		// 			type: 'number',
		// 			label: 'Test',
		// 			default: 5,
		// 			min: 0,
		// 			max: 100,
		// 		},
		// 	],
		// 	callback: async (action) => {
		// 		console.log('Hello world!', self.config)
		// 	},
		// },
		send_command: {
			name: 'Send Protocol 3000 Command',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value: 'Send a protocol 3000 command to a single device. Commands are automatically prefixed & suffixed accordingly, you only need the command body.',
					width: 12,
				},
				{
					id: 'command',
					type: 'textinput',
					label: 'Command',
					default: '',
					useVariables: true,
					width: 12,
				},
				{
					id: 'devicetype',
					type: 'dropdown',
					label: 'Device Type',
					choices: [
						{ id: 'encoder', label: 'Encoder' },
						{ id: 'decoder', label: 'Decoder' },
					],
					default: 'encoder',
				},
				{
					id: 'encoder',
					type: 'dropdown',
					label: 'Encoder',
					choices: encoderChoices,
					default: defaultEncoderChoice,
					isVisible: (optionValues) => optionValues.devicetype === 'encoder'
				},
				{
					id: 'decoder',
					type: 'dropdown',
					label: 'Decoder',
					choices: decoderChoices,
					default: defaultDecoderChoice,
					isVisible: (optionValues) => optionValues.devicetype === 'decoder'
				},
			],
			callback: async (action) => {
				const cmd = await self.parseVariablesInString("#"+action.options.command+"\r")
				const sockets = action.options.devicetype == 'encoder' ? self.encoderSockets : self.decoderSockets
				const device = action.options.devicetype == 'encoder' ? action.options.encoder : action.options.decoder
				if (sockets !== undefined && sockets.at(parseInt(device)).isConnected) {
					console.log('Sending command to ' + action.options.devicetype + ' ' + (parseInt(device)+1) + ': ' + cmd)
					sockets.at(parseInt(device)).send(cmd)
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
					value: 'Broadcast a protocol 3000 command to all connected devices of selected type. Commands are automatically prefixed & suffixed accordingly, you only need the command body.',
					width: 12,
				},
				{
					id: 'command',
					type: 'textinput',
					label: 'Command',
					default: '',
					useVariables: true,
					width: 12,
				},
				{
					id: 'devicetype',
					type: 'dropdown',
					label: 'Device Type',
					choices: [
						{ id: 'encoder', label: 'Encoder' },
						{ id: 'decoder', label: 'Decoder' },
					],
					default: 'encoder',
				},
			],
			callback: async (action) => {
				const cmd = await self.parseVariablesInString("#"+action.options.command+"\r")
				const sockets = action.options.devicetype == 'encoder' ? self.encoderSockets : self.decoderSockets
				console.log('Broadcasting command to all ' + action.options.devicetype + 's: ' + cmd)
				sockets.forEach((socket) => {
					if (!socket.isConnected) {
						console.log("Socket not connected!")
						return
					}
					socket.send(cmd)
				});
			},
		},
	}

}
