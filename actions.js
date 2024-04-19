export function getActionDefinitions (self) {
	return {
		sample_action: {
			name: 'My First Action',
			options: [
				{
					id: 'num',
					type: 'number',
					label: 'Test',
					default: 5,
					min: 0,
					max: 100,
				},
			],
			callback: async (action) => {
				console.log('Hello world!', self.config)
			},
		},

		send_command: {
			name: 'Send Command',
			options: [
				{
					id: 'command',
					type: 'textinput',
					label: 'Command',
					default: '',
					useVariables: true,
				},
			],
			callback: async (action) => {
				console.log('Sending test command')
				const cmd = await self.parseVariablesInString(action.options.command+"\r")

				if (cmd != '') {

					console.log('debug', 'sending to ' + self.config.host + ': ' + cmd)

					if (self.socket !== undefined && self.socket.isConnected) {
						self.socket.send(cmd)
					} else {
						console.log('debug', 'Socket not connected :(')
					}
				} else {
					console.log('Empty message not sent.')
				}
			},
		}
	}

}
