import { Regex } from '@companion-module/base'

export const ConfigFields = [
    {
        type: 'textinput',
        id: 'host',
        label: 'Target IP',
        width: 8,
        regex: Regex.IP,
    },
    {
        type: 'textinput',
        id: 'port',
        label: 'Target Port',
        width: 4,
        regex: Regex.PORT,
    },
    
]