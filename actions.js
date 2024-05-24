import { PROTOCOL3000COMMANDS } from './constants.js'

export function getActionDefinitions (self) {
	if (!self.config.port) return {}

	const encoderChoices = self.encoderSockets.map((encoder) => ({
		id: encoder.channelId,
		label: `Channel ${encoder.channelId}`
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
			{ id: 'previous', label: 'Previous' }
		],
		default: 'next'
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
					width: 12
				}
			],
			callback: async (action) => {
				if (!self.config.port) return
				const cmd = await self.parseVariablesInString(action.options.text)
				console.log(cmd)
			}
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
					width: 12
				},
				{
					type: 'checkbox',
					id: 'free_input',
					label: 'Free input',
					default: false,
					width: 12
				},
				{
					id: 'command_selection',
					type: 'dropdown',
					label: 'Command',
					choices: PROTOCOL3000COMMANDS,
					default: '#',
					isVisible: (options) => !options.free_input
				},
				{
					id: 'parameters',
					type: 'textinput',
					label: 'Parameters',
					default: '',
					useVariables: true,
					width: 12,
					isVisibleData: PROTOCOL3000COMMANDS,
					isVisible: (options) => !options.free_input
				},
				{
					id: 'command',
					type: 'textinput',
					label: 'Command and parameters',
					default: '',
					useVariables: true,
					width: 12,
					isVisible: (options) => options.free_input
				},
				{
					id: 'device_type',
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
					label: 'Encoder channel',
					choices: encoderChoices,
					default: encoderDefault,
					isVisible: (options) => options.device_type === 'encoder'
				},
				{
					id: 'decoder',
					type: 'dropdown',
					label: 'Decoder number',
					choices: decoderChoices,
					default: decoderDefault,
					isVisible: (options) => options.device_type === 'decoder'
				}
			],
			callback: async (action) => {
				if (!self.config.port) return
				const options = action.options
				const cmdContent = options.free_input
					? `#${options.command}\r`
					: `${options.command_selection} ${options.parameters}\r`
				const cmd = await self.parseVariablesInString(cmdContent)
				const sockets = options.device_type == 'encoder' ? self.encoderSockets : self.decoderSockets
				const deviceNumber = options.device_type == 'encoder' ? options.encoder : options.decoder
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
					id: 'free_input',
					label: 'Free input',
					default: false,
					width: 12
				},
				{
					id: 'command_selection',
					type: 'dropdown',
					label: 'Command',
					choices: PROTOCOL3000COMMANDS,
					default: '#',
					isVisible: (options) => !options.free_input
				},
				{
					id: 'parameters',
					type: 'textinput',
					label: 'Parameters',
					default: '',
					useVariables: true,
					width: 12,
					isVisibleData: PROTOCOL3000COMMANDS,
					isVisible: (options) => !options.free_input
				},
				{
					id: 'command',
					type: 'textinput',
					label: 'Command and parameters',
					default: '',
					useVariables: true,
					width: 12,
					isVisible: (options) => options.free_input
				},
				{
					id: 'device_type',
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
			}
		}
	}

	if (self.config.videowall && self.videowall !== undefined) {
		function subsetChoiceArray () {
			const subsets = self.videowall.subsets
			return [...Array(self.videowall.subsets.length).keys()].map((x) => {
				const subset = subsets.at(x)
				return { id: subset.id, label: `${subset.id}: ${subset.elements.length} elements` }
			})
		}
		const subsetChoices = subsetChoiceArray()
		const subsetChoicesAddNew = subsetChoices.concat({ id: 'new', label: 'Add into new subset' })
		subsetChoicesAddNew.push({ id: 'latest', label: 'Newest created subset' })
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
					id: 'free_input',
					label: 'Free input',
					default: false,
					width: 12
				},
				{
					id: 'command_selection',
					type: 'dropdown',
					label: 'Command',
					choices: PROTOCOL3000COMMANDS,
					default: '#',
					isVisible: (options) => !options.free_input
				},
				{
					id: 'parameters',
					type: 'textinput',
					label: 'Parameters',
					default: '',
					useVariables: true,
					width: 12,
					isVisibleData: PROTOCOL3000COMMANDS,
					isVisible: (options) => !options.free_input
				},
				{
					id: 'command',
					type: 'textinput',
					label: 'Command and parameters',
					default: '',
					useVariables: true,
					width: 12,
					isVisible: (options) => options.free_input
				},
				{
					type: 'checkbox',
					id: 'use_current',
					label: 'Use currently selected subset',
					default: true
				},
				{
					id: 'subset_selection',
					type: 'dropdown',
					label: 'Subset',
					choices: subsetChoices,
					default: defaultSubset,
					isVisible: (options) => !options.use_current
				}
			],
			callback: async (action) => {
				const options = action.options
				const cmdContent = options.free_input
					? `#${options.command}\r`
					: `${options.command_selection} ${options.parameters}\r`
				const cmd = await self.parseVariablesInString(cmdContent)
				const selectionId = options.use_current ? self.getVariableValue('selected_subset') : options.subset_selection
				const subset = self.videowall.subsets.find((subset) => subset.id === selectionId)
				console.log(`Multicasting to all decoders in subset ${subset.id} command:`, cmd)

				subset.elements.forEach((element) => {
					const socket = self.decoderSockets.find((socket) => socket.id === element.index + 1)
					if (!socket.isConnected) {
						console.log(`Socket for ${socket.label} not connected!`)
						return
					}
					socket.send(cmd.replace('<Id>', element.outputId))
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
					value: `Add a decoder to a subset of the module's internal video wall model. This action does NOT send any commands by itself. 
						Select 'Add into new subset' from the dropdown to create a new subset and add the decoder into it.
						The 'Newest created subset' option can be used to chain together actions where the first one creates a new subset and the others are added into that.`,
					width: 12
				},
				{
					id: 'subset_selection',
					type: 'dropdown',
					label: 'Subset',
					choices: subsetChoicesAddNew,
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
				const options = action.options
				const subset =
					options.subset_selection === 'new'
						? self.videowall.addSubset()
						: options.subset_selection === 'latest'
						? self.videowall.subsets.at(-1)
						: self.videowall.subsets.find((subset) => subset.id === options.subset_selection)
				const element = self.videowall.elements.find((element) => element.index == options.decoder)
				subset.addElement(element)
				if (self.videowall.removeEmptySubsets()) {
					self.setVariableValues({ selected_subset: self.videowall.subsets.at(0).id })
				}
			}
		}
		actions.new_subset = {
			name: 'Add new subset',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value: "Add a new subset into the module's internal video wall model.",
					width: 12
				}
			],
			callback: async (action) => {
				if (self.videowall.subsets.length < self.videowall.maxSubsets) {
					const subset = self.videowall.addSubset()
					console.log(`Added new subset to internal video wall, id: ${subset.id}`)
				}
			}
		}
		actions.change_subset_input = {
			name: 'Change subset input',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value: `Change the input for all decoders in a video wall subset. 'Use currently selected channel' gets the subset id from the selected_subset variable. Use the action 'Cycle subset selection' to change the variable's value.`,
					width: 12
				},
				{
					type: 'checkbox',
					id: 'use_selected_subset',
					label: 'Use currently selected subset',
					default: true
				},
				{
					id: 'subset_selection',
					type: 'dropdown',
					label: 'Subset',
					choices: subsetChoices,
					default: defaultSubset,
					isVisible: (options) => !options.use_selected_subset
				},
				{
					type: 'checkbox',
					id: 'use_selected_channel',
					label: 'Use currently selected channel',
					default: true
				},
				{
					id: 'channel',
					type: 'dropdown',
					label: 'Channel',
					choices: encoderChoices,
					default: encoderDefault,
					isVisible: (options) => !options.use_selected_channel
				}
			],
			callback: async (action) => {
				const options = action.options
				const subsetSelectionId = options.use_selected_subset
					? self.getVariableValue('selected_subset')
					: options.subset_selection
				const subset = self.videowall.subsets.find((subset) => subset.id === subsetSelectionId)
				const channelId = options.use_selected_channel ? self.getVariableValue('selected_channel') : options.channel

				console.log(`Switching subset ${subset.id} channel to ${channelId}`)

				subset.elements.forEach((element) => {
					const socket = self.decoderSockets.find((socket) => socket.id === element.index + 1)
					if (!socket.isConnected) {
						console.log(`Socket for ${socket.label} not connected!`)
						return
					}
					socket.send(`#KDS-CHANNEL-SELECT VIDEO,${channelId}\r`)
				})
			}
		}
		actions.apply_videowall = {
			name: 'Apply current video wall partitioning',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value: 'Synchronize the decoders with current internal video wall partitioning setup.',
					width: 12
				}
			],
			callback: async () => {
				if (!self.config.port || self.videowall === undefined) return
				for (const subset of self.videowall.subsets) {
					if (!subset.hasNewChanges) continue
					subset.elements.forEach((element) => {
						const socket = self.decoderSockets.find((socket) => socket.id === element.index + 1)
						if (!socket.isConnected) {
							console.log(`Socket for ${socket.label} not connected!`)
							return
						}
						socket.send(`#VIEW-MOD 15,${subset.width},${subset.height}\r`)
						socket.send(`#VIDEO-WALL-SETUP ${element.outputId},0\r`)
					})
				}
			}
		}
		actions.clear_videowall = {
			name: 'Reset internal video wall partitioning',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value:
						"Clears all subsets from the current internal video wall model, i.e. results in only one view area spanning the entire video wall. Chain with the 'apply partitioning' action to reset the actual video wall.",
					width: 12
				}
			],
			callback: async () => {
				if (!self.config.port || self.videowall === undefined) return
				console.log('Resetting video wall partition')
				self.videowall.clear()
				self.setVariableValues({ selected_subset: self.videowall.subsets.at(0).id })
			}
		}
		actions.sync_stuff = {
			name: 'Update actions and feedbacks',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value: "Updates this module's action and feedback definitions.",
					width: 12
				}
			],
			callback: async () => {
				self.updateActions()
				self.updateFeedbacks()
			}
		}
		actions.cycle_selected_subset = {
			name: 'Cycle subset selection',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value:
						'Changes the selected subset variable for the next/previous one. Loops around if next/previous is out of bounds.',
					width: 12
				},
				DirectionChoice
			],
			callback: async (action) => {
				const selected_subset = parseInt(self.getVariableValue('selected_subset'))
				if (selected_subset === NaN || self.videowall.subsets.length === 1) {
					return
				}
				const direction = action.options.direction === 'next' ? 1 : -1
				self.setVariableValues({
					selected_subset: self.videowall.subsets.at((selected_subset - 1 + direction) % self.videowall.subsets.length)
						.id
				})
			}
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
					width: 12
				},
				DirectionChoice
			],
			callback: async (action) => {
				const selected_channel = parseInt(self.getVariableValue('selected_channel'))
				if (selected_channel === NaN || self.encoderSockets.length === 1) {
					return
				}
				const currentEncoderIndex = self.encoderSockets.findIndex((element) => element.channelId === selected_channel)
				const direction = action.options.direction === 'next' ? 1 : -1
				self.setVariableValues({
					selected_channel: self.encoderSockets.at((currentEncoderIndex + direction) % self.encoderSockets.length)
						.channelId
				})
			}
		}
		actions.toggle_corner = {
			name: 'Toggle corner view',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value: '',
					width: 12
				},
				DirectionChoice
			],
			callback: async (action) => {}
		}
		actions.log_videowall_status = {
			name: 'DEBUG Log video wall status',
			options: [
				{
					type: 'static-text',
					id: 'title',
					label: 'Information',
					value: 'test',
					width: 12
				}
			],
			callback: async (action) => {
				if (self.videowall === undefined) return
				console.log(self.videowall)
				console.log(self.videowall.elements)
				console.log(self.videowall.subsets)
				self.videowall.subsets.forEach((subset) => {
					console.log(`subset ${subset.id} has changes?: ${subset.peekChanges()}`)
				})
			}
		}
	}
	return actions
}
