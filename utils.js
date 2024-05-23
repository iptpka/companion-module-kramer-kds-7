export function incrementedIP (IPAddress, amount) {
	let split = IPAddress.split('.')
	split[split.length - 1] = parseInt(split[split.length - 1]) + amount
	return split.join('.')
}
