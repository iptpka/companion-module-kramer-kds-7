import { Regex } from '@companion-module/base'

export const ConfigFields = [
	{
		type: 'textinput',
		id: 'port',
		label: 'Target Port',
		width: 4,
		regex: Regex.PORT
	},
	{
		type: 'checkbox',
		id: 'videowall',
		label: 'Is this module used for controlling a video wall',
		default: true,
		width: 4
	},
	{
		type: 'number',
		id: 'videowallrows',
		label: 'Rows in video wall',
		default: 1,
		min: 1,
		max: 256,
		isVisible: (options) => options.videowall
	},
	{
		type: 'number',
		id: 'videowallcolumns',
		label: 'Columns in video wall',
		default: 1,
		min: 1,
		max: 256,
		isVisible: (options) => options.videowall
	},
	{
		type: 'static-text',
		id: 'separator1',
		label: ' ',
		value: ' ',
		width: 12
	},
	{
		type: 'static-text',
		id: 'encodersection',
		label: 'Encoders',
		value: 'Set the amount of encoder devices and beginning of IP address range.',
		width: 12
	},
	{
		type: 'number',
		id: 'encoderamount',
		label: 'Encoder Amount',
		default: 1,
		min: 1,
		max: 256
	},
	{
		type: 'textinput',
		id: 'encoderaddress',
		label: 'IP of first encoder device',
		width: 8,
		regex: Regex.IP,
		default: '192.168.0.0'
	},
	{
		type: 'static-text',
		id: 'separator2',
		label: ' ',
		value: ' ',
		width: 12
	},
	{
		type: 'static-text',
		id: 'decodersection',
		label: 'Decoders',
		value: 'Set the amount of decoder devices and beginning of IP address range.',
		width: 12
	},
	{
		type: 'number',
		id: 'decoderamount',
		label: 'Decoder Amount',
		default: 1,
		min: 1,
		max: 256
	},
	{
		type: 'textinput',
		id: 'decoderaddress',
		label: 'IP of first decoder device',
		width: 8,
		regex: Regex.IP,
		default: '192.168.0.0'
	}
]
