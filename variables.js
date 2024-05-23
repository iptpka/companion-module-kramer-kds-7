export function getVariableDefinitions (self) {
	const variables = [{ variableId: 'tcp_response', name: 'Tcp Response' }, {variableId: 'selected_channel', name: 'Selected Channel'}]
	if (self.config.videowall) {
		variables.push({variableId: 'selected_subset', name: 'Selected Subset'})
	} 
	return variables
}
