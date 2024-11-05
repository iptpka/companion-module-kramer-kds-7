import { combineRgb } from '@companion-module/base'

export function getFeedbackDefinitions(self) {
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
					type: 'number',
					label: 'Area',
					min: 1,
					max: 999,
					default: 1,
				},
				{
					id: 'channel',
					type: 'number',
					label: 'Channel',
					min: 1,
					max: 999,
					default: 1,
				},
			],
			callback: (feedback) => {
				if (
					!(
						self.channels.some((channel) => channel === feedback.options.channel) &&
						self.videowall.areas.some((area) => area.id === feedback.options.area)
					)
				)
					return false //selected area or channel not found
				if (self.videowall.areas.find((area) => area.id === feedback.options.area).channel === feedback.options.channel) {
					return true
				} else {
					return false
				}
			},
		},
		AreaExists: {
			name: 'Area: Area exists',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'area',
					type: 'number',
					label: 'Area',
					min: 1,
					max: 999,
					default: 1,
				},
			],
			callback: (feedback) => {
				if (self.videowall.areas.some((area) => area.id === feedback.options.area)) {
					return true
				} else {
					return false
				}
			},
		},
		ChannelExists: {
			name: 'Channel: Channel exists',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'channel',
					type: 'number',
					label: 'Channel',
					min: 1,
					max: 999,
					default: 1,
				},
			],
			callback: (feedback) => {
				//should this be an async query to encoder if that channel is actually outputting something? 
				if (self.channels.some((channel) => channel === feedback.options.channel)) {
					return true
				} else {
					return false
				}
			},
		},
	}
	return feedbacks
}
