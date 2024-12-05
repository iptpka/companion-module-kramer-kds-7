export function getVariableDefinitions(self) {
	const variables = [
		{ variableId: 'selected_channel', name: 'Selected channel' },
		{ variableId: 'channel_amount', name: 'Channel amount' },
		{ variableId: 'default_channel', name: 'Default channel' },
		{ variableId: 'new_connected_input', name: 'Newest connected input channel' },
		{ variableId: 'auto_swapped_channels', name: 'Auto-switched channels' },
	]
	if (self.config.isvideowall) {
		variables.push(
			{ variableId: 'selected_area', name: 'Selected Area' },
			{ variableId: 'area_amount', name: 'Area Amount' },
			{ variableId: 'newest_area', name: 'Newest Area' }
		)
	}
	
	return variables
}
