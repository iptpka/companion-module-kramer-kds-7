export function getVariableDefinitions(self) {
	const variables = [
		{ variableId: 'selected_channel', name: 'Selected Channel' },
		{ variableId: 'channel_amount', name: 'Channel Amount' },
	]
	if (self.config.videowall) {
		variables.push({ variableId: 'selected_subset', name: 'Selected Subset' })
		variables.push({ variableId: 'subset_amount', name: 'Subset Amount' })
	}
	return variables
}
