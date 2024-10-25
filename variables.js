export function getVariableDefinitions(self) {
	const variables = [
		{ variableId: 'selected_channel', name: 'Selected Channel' },
		{ variableId: 'channel_amount', name: 'Channel Amount' },
		{ variableId: 'default_channel', name: 'Default Channel' },
	]
	if (self.config.videowall) {
		variables.push(
			{ variableId: 'selected_area', name: 'Selected Area' },
			{ variableId: 'area_amount', name: 'Area Amount' }
		)
	}
	return variables
}
