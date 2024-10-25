import { combineRgb } from '@companion-module/base'

export function getFeedBackDefinitions(self) {
	if (!self.configOk) return {}
	const encoderChoices = self.encoderSockets.map((encoder) => ({
		id: encoder.channelId,
		label: `Channel ${encoder.channelId}`,
	}))
	const defaultEncoder = encoderChoices.at(0).id
	const areas = self.videowall.areas
	const areaChoices = [...Array(self.videowall.areas.length).keys()].map((x) => {
		const area = areas.at(x)
		return { id: area.id, label: `${area.id}: ${area.elements.length} elements` }
	})
	const defaultArea = areaChoices.at(0).id
	const feedbacks = {
		AreaChannel: {
			name: 'Area: Check channel',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'area',
					type: 'dropdown',
					label: 'Area',
					choices: areaChoices,
					default: defaultArea,
				},
				{
					id: 'channel',
					type: 'dropdown',
					label: 'Channel',
					choices: encoderChoices,
					default: defaultEncoder,
				}

			],
			callback: (feedback) => {
				if (self.videowall.areas.at(feedback.options.area - 1).channel === feedback.options.channel) {
					return true
				} else {
					return false
				}
			},
		},
	}
	return feedbacks
}
