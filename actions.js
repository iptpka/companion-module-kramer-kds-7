import { Regex } from '@companion-module/base'
import { AREA, CHANNEL, PROTOCOL3000COMMANDS, INTEGER_LIST_OR_RANGE } from './constants.js'
import { getFeedbackDefinitions } from './feedbacks.js'
import { parseRangeOrListStringToArray } from './utils.js'

export function getActionDefinitions(self) {
	if (!self.configOk) return {}
	const encoderChoices = self.encoderSockets.map((encoder) => ({
		id: encoder.channelId,
		label: `Channel ${encoder.channelId}`,
	}))
	
	function sendToArea(area, callback) {
		area.elements.forEach((element) => { 
			const socket = self.decoderSockets.at(element.index)
			if (!socket.isConnected || !self.configOk) {
				self.log('warn', `Socket for ${socket.label} not connected!`)
				return
			}
			callback(socket, area, element)
		})
	}
	
	function syncAreaElement(socket, area, element) {
		socket.send(`#VIEW-MOD 15,${area.width},${area.height}\r`)
		socket.send(`#VIDEO-WALL-SETUP ${element.outputId},0\r`)
		socket.send(`#KDS-CHANNEL-SELECT VIDEO,${area.channel}\r`)
	}
	
	encoderChoices.push({ id: self.config.defaultchannel, label: `Default Channel (${self.config.defaultchannel})` })
	const decoderChoices = self.decoderSockets.map((decoder) => ({ id: decoder.id, label: decoder.id }))
	const encoderDefault = encoderChoices.at(0).id
	const decoderDefault = decoderChoices.at(0).id
	const feedbackIds = Object.keys(getFeedbackDefinitions(self))
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
					type: 'textinput',
					label: 'Encoder channel',
					default: encoderDefault,
					isVisible: (options) => options.device_type === 'encoder',
					regex: CHANNEL,
				},
				{
					id: 'decoder',
					type: 'textinput',
					label: 'Decoder number',
					default: decoderDefault,
					isVisible: (options) => options.device_type === 'decoder',
					regex: CHANNEL,
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
				const deviceNumber = await self.parseVariablesInString(
					options.device_type == 'encoder' ? options.encoder : options.decoder
				)
				if (sockets !== undefined && sockets.at(parseInt(deviceNumber - 1)).isConnected) {
					let socket = sockets.at(parseInt(deviceNumber - 1))
					self.log('info', `Sending command to ${socket.label}: ${cmd}`)
					socket.send(cmd)
				} else {
					self.log('warn', 'Socket not connected!')
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
				self.log('info', `Broadcasting to all ${options.device_type}s command: ${cmd}`)
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

	if (self.config.isvideowall && self.videowall !== undefined) {
		const areas = self.videowall.areas
		const areaChoices = [...Array(self.videowall.areas.length).keys()].map((x) => {
			const area = areas.at(x)
			return { id: area.id, label: `${area.id}: ${area.elements.length} elements` }
		})
		const areaChoicesAddNew = areaChoices.concat({ id: 'new', label: 'Add into new area' })
		areaChoicesAddNew.push({ id: 'latest', label: 'Newest created area' })

		actions.area_multicast = {
			name: 'Multicast Protocol 3000 Command to Area',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value:
						'Multicast a Protocol 3000 command to all decoders in selected video wall area. Commands are automatically prefixed & suffixed accordingly, you only need the command name and parameters. Use <Id> as parameter to replace that with the corresponding device output id.',
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
					id: 'area_selection',
					type: 'textinput',
					label: 'Area',
					default: '1',
					regex: AREA,
				},
			],
			callback: async (action) => {
				if (!self.configOk || self.videowall === undefined) return
				const options = action.options
				const cmdContent = options.free_input
					? `#${options.command}\r`
					: `${options.command_selection} ${options.parameters}\r`
				const cmd = await self.parseVariablesInString(cmdContent)
				const selectionId = await self.parseVariablesInString(options.area_selection)
				const area = self.videowall.areas.find((area) => area.id === selectionId)
				self.log('info', `Multicasting to all decoders in area ${area.id} command: ${cmd}`)
				sendToArea(area, (socket, _, element) => {socket.send(cmd.replace('<Id>', element.outputId))})
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
					default: '1',
				},
				{
					id: 'decoderIds',
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
					label: 'Area is background',
					tooltip:
						"Is this used as a 'background'. If yes, will always act as if this area spans the whole wall, regardless of the actual dimensions of it's elements",
					default: false,
					isVisible: (options) => options.area_selection === 'new',
				},
			],
			callback: async (action) => {
				if (!self.configOk || self.videowall === undefined) return
				const options = action.options
				let area
				//TODO CHANGE THIS
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
						area = self.videowall.areas.find((area) => area.id == options.area_selection)
				}
				options.decoderIds.forEach((decoderId) => {
					const element = self.videowall.elements.find((element) => element.index == decoderId - 1)
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
		actions.add_to_area_refactor = {
			name: 'Add Decoders to Area',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value: `Add decoders to a area of the module's internal video wall model.`,
					width: 12,
				},
				{
					id: 'area',
					type: 'textinput',
					label: 'Area',
					default: '1',
					regex: AREA,
					useVariables: true,
				},
				{
					id: 'selection_type',
					type: 'dropdown',
					label: 'Selection type',
					choices: [
						{ id: 'single', label: 'Single' },
						{ id: 'rectangle', label: 'Rectangle' },
						{ id: 'range', label: 'Range' },
						{ id: 'list', label: 'List' },
					],
					default: encoderDefault,
					isVisible: (options) => options.area_selection === 'new',
				},
				{
					id: 'decoderIds',
					type: 'textinput',
					label: 'Decoders',
					default: '',
					regex: INTEGER_LIST_OR_RANGE,
					useVariables: true,
				},
			],
			callback: async (action) => {
				if (!self.configOk || self.videowall === undefined) return
				const options = action.options
				const area = await self.parseVariablesInString(options.area)
				options.decoderIds.forEach((decoderId) => {
					const element = self.videowall.elements.find((element) => element.index == decoderId - 1)
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
			name: 'Create new area',
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
					type: 'textinput',
					label: 'Channel',
					default: encoderDefault,
					regex: CHANNEL,
				},
				{
					id: 'selection_type',
					type: 'dropdown',
					label: 'Selection type',
					choices: [
						{ id: 'list', label: 'List' },
						{ id: 'rectangle', label: 'Rectangle' },
					],
					default: 'list',
				},
				{
					id: 'decoder_Ids',
					type: 'textinput',
					label: 'Decoders',
					default: '',
					regex: INTEGER_LIST_OR_RANGE,
					useVariables: true,
					isVisible: (options) => options.selection_type === 'list',
				},
				{
					id: 'first_corner',
					type: 'textinput',
					label: 'First corner',
					default: '1',
					regex: Regex.NUMBER,
					useVariables: true,
					isVisible: (options) => options.selection_type === 'rectangle',
				},
				{
					id: 'second_corner',
					type: 'textinput',
					label: 'Second corner',
					default: '1',
					regex: Regex.NUMBER,
					useVariables: true,
					isVisible: (options) => options.selection_type === 'rectangle',
				},
				{
					type: 'checkbox',
					id: 'is_background',
					label:
						"Is this used as a 'background'. If yes, will always act as if this area spans the whole wall, regardless of the actual dimensions of its elements",
					default: false,
				},
			],
			callback: async (action) => {
				if (!self.configOk || self.videowall === undefined) return
				if (self.videowall.areas.length < self.videowall.maxAreas) {
					try {
						const channelId = parseInt(await self.parseVariablesInString(action.options.channel))
						let elements = []
						if (action.options.selection_type == 'rectangle') {
							const first_corner = parseInt(action.options.first_corner) - 1
							const second_corner = parseInt(action.options.second_corner) - 1
							if (Math.max(first_corner, second_corner) > self.videowall.elements.length) {
								throw new Error('Area selection out of bounds!')
							}
							const wall_width = self.videowall.columns
							const x1 = first_corner % wall_width
							const y1 = Math.floor(first_corner / wall_width)
							const x2 = second_corner % wall_width
							const y2 = Math.floor(second_corner / wall_width)
							const selection_width = Math.abs(x2 - x1) + 1
							const selection_height = Math.abs(y2 - y1) + 1
							const element_amount = selection_width * selection_height
							const x_offset = Math.min(x1, x2)
							let x = 0
							let y = Math.min(y1, y2)
							while (elements.length < element_amount) {
								const element = self.videowall.elements.at(x_offset + x + y * wall_width)
								elements.push(element)
								y = x == selection_width - 1 ? y + 1 : y
								x = (x + 1) % selection_width
							}
						} else {
							const decoderId = parseRangeOrListStringToArray(action.options.decoder_Ids)
							decoderId.forEach((decoderId) => {
								elements.push(self.videowall.elements.at(decoderId - 1))
							})
						}
						const area = self.videowall.addArea(elements, channelId, action.options.is_background)
						self.videowall.removeEmptyAreas()
						self.log('debug', `Added new area to internal video wall, id: ${area.id}`)
					} catch (error) {
						self.log('error', error.message)
					}
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
					value: `Change the input channel for all decoders in a video wall area.`,
					width: 12,
				},
				{
					id: 'area',
					type: 'textinput',
					label: 'Area',
					default: '1',
					regex: AREA,
					useVariables: true,
				},
				{
					id: 'channel',
					type: 'textinput',
					label: 'Channel',
					default: encoderDefault,
					regex: CHANNEL,
					useVariables: true,
				},
				{
					id: 'send',
					type: 'checkbox',
					label: 'Send immediately',
					default: true,
				},
			],
			callback: async (action) => {
				if (!self.configOk || self.videowall === undefined) return
				try {
					const options = action.options
					const areaSelectionId = await self.parseVariablesInString(options.area)
					const area = self.videowall.areas.find((area) => area.id == areaSelectionId)
					if (area === undefined) return // this area not in use
					const channelId = await self.parseVariablesInString(options.channel)
					area.channel = parseInt(channelId)
					if (!options.send) return
					self.log('info', `Switching area ${area.id} channel to ${await channelId}`)
					sendToArea(area, (socket) => socket.send(`#KDS-CHANNEL-SELECT VIDEO,${channelId}\r`))
				} catch (error) {
					self.log('error', error.message)
				}
			},
		}
		actions.set_area_is_background = {
			name: 'Area: Change type (background)',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value: `Set an area to act as a "background" or not.`,
					width: 12,
				},
				{
					id: 'area',
					type: 'textinput',
					label: 'Area',
					default: '1',
					regex: AREA,
					useVariables: true,
				},
				{
					id: 'is_background',
					type: 'dropdown',
					label: 'Is background?',
					choices: [
						{ id: 'true', label: 'True' },
						{ id: 'false', label: 'False' },
						{ id: 'toggle', label: 'Toggle' },
					],
					default: 'true',
				},
				{
					id: 'send',
					type: 'checkbox',
					label: 'Send immediately',
					default: true,
				},
			],
			callback: async (action) => {
				if (!self.configOk || self.videowall === undefined) return
				try {
					const options = action.options
					const areaSelectionId = await self.parseVariablesInString(options.area)
					const area = self.videowall.areas.find((area) => area.id == areaSelectionId)
					if (area === undefined) return // this area not in use
					const isBackground =
						options.isBackground == 'toggle' ? !area.isBackground : options.isBackground == 'true' ? true : false
					area.setIsBackground(isBackground)
					if (!options.send) return
					sendToArea(area, syncAreaElement)
				} catch (error) {
					self.log('error', error.message)
				}
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
			],
			callback: async (action) => {
				if (!self.configOk || self.videowall === undefined) return
				try {
					for (const area of self.videowall.areas) {
						sendToArea(area, syncAreaElement)
					}
				} catch (error) {
					self.log('error', error.message)
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
				self.log('debug', 'Resetting video wall partitioning')
				try {
					self.videowall.clear()
					self.setVariableValues({ selected_area: self.videowall.areas.at(0).id })
					self.setVariableValues({ area_amount: 1 })
				} catch (error) {
					self.log('error', error.message)
				}
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
				try {
					self.updateActions()
					self.updateFeedbacks()
				} catch (error) {
					self.log('error', error.message)
				}
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
					selected_area: self.videowall.areas.at((selected_area - 1 + direction) % self.videowall.areas.length).id,
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
					self.log('debug', `area ${area.id} has changes?: ${area.peekChanges()}`)
				})
				self.log('debug', `Area amount: ${self.videowall.areas.length}`)
			},
		}
	}
	return actions
}
