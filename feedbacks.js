import { combineRgb } from '@companion-module/base'
import { CHANNEL, AREA } from './constants.js'

export function getFeedbackDefinitions(self) {
	if (!self.configOk) return {}
	const encoderChoices = self.encoderSockets.map((encoder) => ({
		id: encoder.channelId,
		label: `Channel ${encoder.channelId}`,
	}))
	const encoderDefault = encoderChoices.at(0).id
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
					type: 'textinput',
					label: 'Area',
					default: '1',
					regex: AREA,
				},
				{
					id: 'channel',
					type: 'textinput',
					label: 'Channel',
					default: encoderDefault,
					regex: CHANNEL
				},
			],
			callback: (feedback) => {
				if (
					!(
						self.encoderSockets.some((encoder) => encoder.channelId == feedback.options.channel) &&
						self.videowall.areas.some((area) => area.id == feedback.options.area)
					)
				)
					return false //selected area or channel not found
				if (self.videowall.areas.find((area) => area.id == feedback.options.area).channel === feedback.options.channel) {
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
				if (self.encoderSockets.some((encoder) => encoder.channelId === feedback.options.channel)) {
					return true
				} else {
					return false
				}
			},
		},
		IsAutoSwapping: {
			name: 'Channel: Is auto-swapping on',
			type: 'boolean',
			options: [
				{
					id: 'channel',
					type: 'textinput',
					label: 'Channel',
					default: '1',
					useVariables: true
				},
			],
			callback: async (feedback, context) => {
				const channel = await context.parseVariablesInString(feedback.options.channel)
				if (self.autoSwappedChannels.includes(channel)) {
					return true
				} else {
					return false
				}
			},
		},
	}
	return feedbacks
}
