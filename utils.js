export function incrementedIP(IPAddress, amount) {
	let split = IPAddress.split('.')
	split[split.length - 1] = parseInt(split[split.length - 1]) + amount
	return split.join('.')
}

export async function promiseAllOrTimeout(promises, milliseconds, timeoutMessage) {
	const timeout = new Promise((_, reject) => {
		setTimeout(reject, milliseconds, new Error(timeoutMessage))
	})
	return Promise.race([Promise.all(promises), timeout])
}
