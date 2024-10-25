import { PROTOCOL3000COMMANDS } from './constants.js'

export function getActionDefinitions(self) {
	if (!self.configOk) return {}
	const encoderChoices = self.encoderSockets.map((encoder) => ({
		id: encoder.channelId,
		label: `Channel ${encoder.channelId}`,
	}))
	const decoderChoices = self.decoderSockets.map((decoder) => ({ id: decoder.id, label: decoder.id }))
	const encoderDefault = encoderChoices.at(0).id
	const decoderDefault = decoderChoices.at(0).id
	const DirectionChoice = {
		id: 'direction',
		type: 'dropdown',
		label: 'Direction',
		choices: [
			{ id: 'next', label: 'Next' },
			{ id: 'previous', label: 'Previous' },
		],
		default: 'next',
	}
	let actions = {
		debug_variable_tester: {
			name: 'Debug variable tester',
			options: [
				{
					id: 'text',
					type: 'textinput',
					label: 'Text',
					default: '',
					useVariables: true,
					width: 12,
				},
			],
			callback: async (action) => {
				if (!self.configOk) return
				const cmd = await self.parseVariablesInString(action.options.text)
				console.log(cmd)
			},
		},
		send_command: {
			name: 'Send Protocol 3000 Command',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value:
						'Send a Protocol 3000 command to a single device. Commands are automatically prefixed & suffixed accordingly, you only need the command name and parameters.',
					width: 12,
				},
				{
					type: 'checkbox',
					id: 'free_input',
					label: 'Free input',
					default: false,
					width: 12,
				},
				{
					id: 'command_selection',
					type: 'dropdown',
					label: 'Command',
					choices: PROTOCOL3000COMMANDS,
					default: '#',
					isVisible: (options) => !options.free_input,
				},
				{
					id: 'parameters',
					type: 'textinput',
					label: 'Parameters',
					default: '',
					useVariables: true,
					width: 12,
					isVisibleData: PROTOCOL3000COMMANDS,
					isVisible: (options) => !options.free_input,
				},
				{
					id: 'command',
					type: 'textinput',
					label: 'Command and parameters',
					default: '',
					useVariables: true,
					width: 12,
					isVisible: (options) => options.free_input,
				},
				{
					id: 'device_type',
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
					label: 'Encoder channel',
					choices: encoderChoices,
					default: encoderDefault,
					isVisible: (options) => options.device_type === 'encoder',
				},
				{
					id: 'decoder',
					type: 'dropdown',
					label: 'Decoder number',
					choices: decoderChoices,
					default: decoderDefault,
					isVisible: (options) => options.device_type === 'decoder',
				},
			],
			callback: async (action) => {
				if (!self.configOk) return
				const options = action.options
				const cmdContent = options.free_input
					? `#${options.command}\r`
					: `${options.command_selection} ${options.parameters}\r`
				const cmd = await self.parseVariablesInString(cmdContent)
				const sockets = options.device_type == 'encoder' ? self.encoderSockets : self.decoderSockets
				const deviceNumber = options.device_type == 'encoder' ? options.encoder : options.decoder
				if (sockets !== undefined && sockets.at(parseInt(deviceNumber - 1)).isConnected) {
					let socket = sockets.at(parseInt(deviceNumber - 1))
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
					value:
						'Broadcast a Protocol 3000 command to all connected devices of selected type. Commands are automatically prefixed & suffixed accordingly, you only need the command name and parameters.',
					width: 12,
				},
				{
					type: 'checkbox',
					id: 'free_input',
					label: 'Free input',
					default: false,
					width: 12,
				},
				{
					id: 'command_selection',
					type: 'dropdown',
					label: 'Command',
					choices: PROTOCOL3000COMMANDS,
					default: '#',
					isVisible: (options) => !options.free_input,
				},
				{
					id: 'parameters',
					type: 'textinput',
					label: 'Parameters',
					default: '',
					useVariables: true,
					width: 12,
					isVisibleData: PROTOCOL3000COMMANDS,
					isVisible: (options) => !options.free_input,
				},
				{
					id: 'command',
					type: 'textinput',
					label: 'Command and parameters',
					default: '',
					useVariables: true,
					width: 12,
					isVisible: (options) => options.free_input,
				},
				{
					id: 'device_type',
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
				if (!self.configOk) return
				const options = action.options
				const cmdContent = options.free_input
					? `#${options.command}\r`
					: `${options.command_selection} ${options.parameters}\r`
				const cmd = await self.parseVariablesInString(cmdContent)
				const sockets = options.device_type == 'encoder' ? self.encoderSockets : self.decoderSockets
				console.log(`Broadcasting to all ${options.device_type}s command:`, cmd)
				sockets.forEach((socket) => {
					if (!socket.isConnected) {
						console.log(`Socket for ${socket.label} not connected!`)
						return
					}
					socket.send(cmd)
				})
			},
		},
	}

	if (self.config.videowall && self.videowall !== undefined) {
		const areas = self.videowall.areas
		const areaChoices = [...Array(self.videowall.areas.length).keys()].map((x) => {
			const area = areas.at(x)
			return { id: area.id, label: `${area.id}: ${area.elements.length} elements` }
		})
		const areaChoicesAddNew = areaChoices.concat({ id: 'new', label: 'Add into new area' })
		areaChoicesAddNew.push({ id: 'latest', label: 'Newest created area' })
		const defaultArea = areaChoices.at(0).id

		actions.area_multicast = {
			name: 'Multicast Protocol 3000 Command to Area',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value:
						'Multicast a Protocol 3000 command to all decoders in selected video wall area. Commands are automatically prefixed & suffixed accordingly, you only need the command name and parameters.',
					width: 12,
				},
				{
					type: 'checkbox',
					id: 'free_input',
					label: 'Free input',
					default: false,
					width: 12,
				},
				{
					id: 'command_selection',
					type: 'dropdown',
					label: 'Command',
					choices: PROTOCOL3000COMMANDS,
					default: '#',
					isVisible: (options) => !options.free_input,
				},
				{
					id: 'parameters',
					type: 'textinput',
					label: 'Parameters',
					default: '',
					useVariables: true,
					width: 12,
					isVisibleData: PROTOCOL3000COMMANDS,
					isVisible: (options) => !options.free_input,
				},
				{
					id: 'command',
					type: 'textinput',
					label: 'Command and parameters',
					default: '',
					useVariables: true,
					width: 12,
					isVisible: (options) => options.free_input,
				},
				{
					type: 'checkbox',
					id: 'use_current',
					label: 'Use currently selected area',
					default: true,
				},
				{
					id: 'area_selection',
					type: 'dropdown',
					label: 'Area',
					choices: areaChoices,
					default: defaultArea,
					isVisible: (options) => !options.use_current,
				},
			],
			callback: async (action) => {
				if (!self.configOk || self.videowall === undefined) return
				const options = action.options
				const cmdContent = options.free_input
					? `#${options.command}\r`
					: `${options.command_selection} ${options.parameters}\r`
				const cmd = await self.parseVariablesInString(cmdContent)
				const selectionId = options.use_current ? self.getVariableValue('selected_area') : options.area_selection
				const area = self.videowall.areas.find((area) => area.id === selectionId)
				console.log(`Multicasting to all decoders in area ${area.id} command:`, cmd)

				area.elements.forEach((element) => {
					const socket = self.decoderSockets.find((socket) => socket.id === element.index + 1)
					if (!socket.isConnected) {
						console.log(`Socket for ${socket.label} not connected!`)
						return
					}
					socket.send(cmd.replace('<Id>', element.outputId))
				})
			},
		}
		actions.add_to_area = {
			name: 'Add Decoders to Area',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value: `Add decoders to a area of the module's internal video wall model. This action does NOT send any commands by itself. 
						Select 'Add into new area' from the dropdown to create a new area and add the decoder into it.
						The 'Newest created area' option can be used to chain together actions where the first one creates a new area and the others are added into that.`,
					width: 12,
				},
				{
					id: 'area_selection',
					type: 'dropdown',
					label: 'Area',
					choices: areaChoicesAddNew,
					default: defaultArea,
				},
				{
					id: 'decoders',
					type: 'multidropdown',
					label: 'Decoder number',
					choices: decoderChoices,
					default: decoderDefault,
				},
				{
					id: 'channel',
					type: 'dropdown',
					label: 'Channel',
					choices: encoderChoices,
					default: encoderDefault,
					isVisible: (options) => options.area_selection === 'new',
				},
				{
					type: 'checkbox',
					id: 'is_background',
					label:
						"Area is background",
					tooltip:
						"Is this used as a 'background'. If yes, will always act as if this area spans the whole wall, regardless of the actual dimensions of it's elements",
					default: false,
					isVisible: (options) => options.area_selection === 'new',
				},
			],
			callback: async (action) => {
				if (!self.configOk || self.videowall === undefined) return
				const options = action.options
				console.log(options.decoders)
				let area
				switch (options.area_selection) {
					case 'new':
						let channel = options.channel
						let is_background = options.is_background
						area = self.videowall.addArea(undefined, channel, is_background)
						break
					case 'latest':
						area = self.videowall.areas.at(-1)
						break
					default:
						area = self.videowall.areas.find((area) => area.id === options.area_selection)
				}
				options.decoders.forEach((decoder) => {
					const element = self.videowall.elements.find((element) => element.index == decoder - 1)
					if (element != null && element != undefined) {
						area.addElement(element)
					}
				})
				if (
					self.videowall.removeEmptyAreas() &&
					parseInt(self.getVariableValue('selected_area')) >= self.videowall.areas.length
				) {
					self.setVariableValues({ selected_area: self.videowall.areas.at(0).id })
				}
				self.setVariableValues({ area_amount: self.videowall.areas.length })
			},
		}
		actions.new_area = {
			name: 'Add new area',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value: "Add a new area into the module's internal video wall model.",
					width: 12,
				},
				{
					id: 'channel',
					type: 'dropdown',
					label: 'Channel',
					choices: encoderChoices,
					default: encoderDefault,
				},
				{
					type: 'checkbox',
					id: 'is_background',
					label:
						"Is this used as a 'background'. If yes, will always act as if this area spans the whole wall, regardless of the actual dimensions of it's elements",
					default: false,
				},
			],
			callback: async (action) => {
				if (!self.configOk || self.videowall === undefined) return
				if (self.videowall.areas.length < self.videowall.maxAreas) {
					const area = self.videowall.addArea(undefined, action.options.channel, action.options.is_background)
					console.log(`Added new area to internal video wall, id: ${area.id}`)
				}
			},
		}
		actions.change_area_channel = {
			name: 'Change area channel',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value: `Change the input channel for all decoders in a video wall area. 'Use currently selected channel' gets the area id from the selected_area variable. Use the action 'Cycle area selection' to change the variable's value.`,
					width: 12,
				},
				{
					type: 'checkbox',
					id: 'use_selected_area',
					label: 'Use currently selected area',
					default: true,
				},
				{
					id: 'area_selection',
					type: 'dropdown',
					label: 'Area',
					choices: areaChoices,
					default: defaultArea,
					isVisible: (options) => !options.use_selected_area,
				},
				{
					type: 'checkbox',
					id: 'use_selected_channel',
					label: 'Use currently selected channel',
					default: true,
				},
				{
					id: 'channel',
					type: 'dropdown',
					label: 'Channel',
					choices: encoderChoices,
					default: encoderDefault,
					isVisible: (options) => !options.use_selected_channel,
				},
			],
			callback: async (action) => {
				if (!self.configOk || self.videowall === undefined) return
				const options = action.options
				const areaSelectionId = options.use_selected_area
					? self.getVariableValue('selected_area')
					: options.area_selection
				const area = self.videowall.areas.find((area) => area.id === areaSelectionId)
				const channelId = options.use_selected_channel ? self.getVariableValue('selected_channel') : options.channel

				console.log(`Switching area ${area.id} channel to ${channelId}`)

				area.elements.forEach((element) => {
					const socket = self.decoderSockets.find((socket) => socket.id === element.index + 1)
					if (!socket.isConnected) {
						console.log(`Socket for ${socket.label} not connected!`)
						return
					}
					socket.send(`#KDS-CHANNEL-SELECT VIDEO,${channelId}\r`)
				})
			},
		}
		actions.apply_videowall = {
			name: 'Apply current video wall partitioning',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value: 'Synchronize the decoders with current internal video wall partitioning setup.',
					width: 12,
				},
				{
					type: 'checkbox',
					id: 'force_apply',
					label: 'Force changes',
					default: true,
				},
			],
			callback: async (action) => {
				if (!self.configOk || self.videowall === undefined) return
				for (const area of self.videowall.areas) {
					if (!action.options.force_apply && !area.hasNewChanges) continue
					area.elements.forEach((element) => {
						const socket = self.decoderSockets.find((socket) => socket.id === element.index + 1)
						if (!socket.isConnected || !self.configOk) {
							console.log(`Socket for ${socket.label} not connected!`)
							return
						}
						socket.send(`#VIEW-MOD 15,${area.width},${area.height}\r`)
						socket.send(`#VIDEO-WALL-SETUP ${element.outputId},0\r`)
						if (action.options.force_apply || element.hasNewChannel) {
							socket.send(`#KDS-CHANNEL-SELECT VIDEO,${area.channel}\r`)
						}
					})
				}
			},
		}
		actions.clear_videowall = {
			name: 'Reset internal video wall partitioning',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value:
						"Clears all areas from the current internal video wall model, i.e. results in only one view area spanning the entire video wall. Chain with the 'apply partitioning' action to reset the actual video wall.",
					width: 12,
				},
			],
			callback: async () => {
				if (self.videowall === undefined || !self.configOk) return
				console.log('Resetting video wall partition')
				self.videowall.clear()
				self.setVariableValues({ selected_area: self.videowall.areas.at(0).id })
				self.setVariableValues({ area_amount: 1 })
			},
		}
		actions.sync_stuff = {
			name: 'Update actions and feedbacks',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value: "Updates this module's action and feedback definitions.",
					width: 12,
				},
			],
			callback: async () => {
				self.updateActions()
				self.updateFeedbacks()
			},
		}
		actions.cycle_selected_area = {
			name: 'Cycle area selection',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value:
						'Changes the selected area variable for the next/previous one. Loops around if next/previous is out of bounds.',
					width: 12,
				},
				DirectionChoice,
			],
			callback: async (action) => {
				const selected_area = parseInt(self.getVariableValue('selected_area'))
				if (selected_area === NaN || self.videowall.areas.length === 1 || !self.configOk) {
					return
				}
				const direction = action.options.direction === 'next' ? 1 : -1
				self.setVariableValues({
					selected_area: self.videowall.areas.at((selected_area - 1 + direction) % self.videowall.areas.length)
						.id,
				})
			},
		}
		actions.cycle_selected_channel = {
			name: 'Cycle channel selection',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value:
						'Changes the selected channel variable for the next/previous one. Loops around if next/previous is out of bounds.',
					width: 12,
				},
				DirectionChoice,
			],
			callback: async (action) => {
				const selected_channel = parseInt(self.getVariableValue('selected_channel'))
				if (selected_channel === NaN || self.encoderSockets.length === 1 || !self.configOk) {
					return
				}
				const currentEncoderIndex = self.encoderSockets.findIndex((element) => element.channelId === selected_channel)
				const direction = action.options.direction === 'next' ? 1 : -1
				self.setVariableValues({
					selected_channel: self.encoderSockets.at((currentEncoderIndex + direction) % self.encoderSockets.length)
						.channelId,
				})
			},
		}
		actions.toggle_corner = {
			name: 'Toggle corner view',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value: '',
					width: 12,
				},
				DirectionChoice,
			],
			callback: async (action) => {},
		}
		actions.log_videowall_status = {
			name: 'DEBUG Log video wall status',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value: 'test',
					width: 12,
				},
			],
			callback: async (action) => {
				if (self.videowall === undefined) return
				console.log(self.videowall)
				console.log(self.videowall.elements)
				console.log(self.videowall.areas)
				self.videowall.areas.forEach((area) => {
					console.log(`area ${area.id} has changes?: ${area.peekChanges()}`)
				})
				console.log(`Area amount: ${self.videowall.areas.length}`)
			},
		}
	}
	return actions
}
