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

export function parseRangeOrListStringToArray(string) {
	if (string.includes('-')) {
		const bounds = string.split('-')
		let start = Math.min(parseInt(bounds[0]))
		const end = Math.max(parseInt(bounds[1]))
		const size = end - start
		return [...Array(size + 1).keys()].map((x) => start++)
	}
	return string.split(',')
}
