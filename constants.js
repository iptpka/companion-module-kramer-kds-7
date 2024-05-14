export const PROTOCOL3000COMMANDS = [
	{
		id: '#',
		label: 'Handshake (#)',
		parameters: null
	},
	{
		id: '#BEACON-EN',
		label: 'BEACON-EN',
		parameters: 'port_id, status, rate'
	},
	{
		id: '#BEACON-INFO?',
		label: 'BEACON-INFO?',
		parameters: 'port_id'
	},
	{
		id: '#BUILD-DATE?',
		label: 'BUILD-DATE?',
		parameters: null
	},
	{
		id: '#CEC-GW-PORT-ACTIVE',
		label: 'CEC-GW-PORT-ACTIVE',
		parameters: 'gateway'
	},
	{
		id: '#CEC-NTFY',
		label: 'CEC-NTFY',
		parameters: null
	},
	{
		id: '#CEC-SND',
		label: 'CEC-SND',
		parameters: 'port_index, sn_id, cmd_name, cec_len, cec_id'
	},
	{
		id: '#COM-ROUTE-ADD',
		label: 'COM-ROUTE-ADD',
		parameters: 'com_id, port_type, port_id, eth_rep_en, timeout'
	},
	{
		id: '#COM-ROUTE-REMOVE',
		label: 'COM-ROUTE-REMOVE',
		parameters: 'com_id'
	},
	{
		id: '#COM-ROUTE?',
		label: 'COM-ROUTE?',
		parameters: 'com_id'
	},
	{
		id: '#CS-CONVERT',
		label: 'CS-CONVERT',
		parameters: 'out_index, cs_mode'
	},
	{
		id: '#CS-CONVERT?',
		label: 'CS-CONVERT?',
		parameters: 'out_index'
	},
	{
		id: '#DEV-STATUS?',
		label: 'DEV-STATUS?',
		parameters: null
	},
	{
		id: '#EDID-ACTIVE',
		label: 'EDID-ACTIVE',
		parameters: 'Input_id,  Index'
	},
	{
		id: '#EDID-ACTIVE?',
		label: 'EDID-ACTIVE?',
		parameters: 'Input_id'
	},
	{
		id: '#EDID-LIST?',
		label: 'EDID-LIST?',
		parameters: null
	},
	{
		id: '#EDID-MODE',
		label: 'EDID-MODE',
		parameters: 'Input_id,  Mode,  Index'
	},
	{
		id: '#EDID-MODE?',
		label: 'EDID-MODE?',
		parameters: 'Input_id'
	},
	{
		id: '#EDID-NET-SRC?',
		label: 'EDID-NET-SRC?',
		parameters: 'input_id'
	},
	{
		id: '#EDID-NET-SRC',
		label: 'EDID-NET-SRC',
		parameters: 'input_id,  src_ip'
	},
	{
		id: '#EDID-RM',
		label: 'EDID-RM',
		parameters: 'Index'
	},
	{
		id: '#ETH-PORT',
		label: 'ETH-PORT',
		parameters: 'port_type, port_id'
	},
	{
		id: '#ETH-PORT?',
		label: 'ETH-PORT?',
		parameters: 'port_type'
	},
	{
		id: '#FACTORY',
		label: 'FACTORY',
		parameters: null
	},
	{
		id: '#GTW-MSG-NUM?',
		label: 'GTW-MSG-NUM?',
		parameters: 'message_type, data'
	},
	{
		id: '#HDCP-MOD',
		label: 'HDCP-MOD',
		parameters: 'in_index, mode'
	},
	{
		id: '#HDCP-MOD?',
		label: 'HDCP-MOD?',
		parameters: 'in_index'
	},
	{
		id: '#HDCP-STAT?',
		label: 'HDCP-STAT?',
		parameters: 'io_mode, in_index'
	},
	{
		id: '#HELP',
		label: 'HELP',
		parameters: null
	},
	{
		id: '#HELP',
		label: 'HELP',
		parameters: 'cmd_name'
	},
	{
		id: '#HW-TEMP?',
		label: 'HW-TEMP?',
		parameters: 'region_id, mode'
	},
	{
		id: '#HW-VERSION?',
		label: 'HW-VERSION?',
		parameters: null
	},
	{
		id: '#IDV',
		label: 'IDV',
		parameters: null
	},
	{
		id: '#IR-SND',
		label: 'IR-SND',
		parameters: 'ir_index, sn_id, cmd_name, repeat_amount, total_packages, package_id, <pronto id...>'
	},
	{
		id: '#KDS-ACTION',
		label: 'KDS-ACTION',
		parameters: 'kds_mode'
	},
	{
		id: '#KDS-ACTION?',
		label: 'KDS-ACTION?',
		parameters: null
	},
	{
		id: '#KDS-AUD',
		label: 'KDS-AUD',
		parameters: 'mode'
	},
	{
		id: '#KDS-AUD?',
		label: 'KDS-AUD?',
		parameters: null
	},
	{
		id: '#KDS-CHANNEL-SELECT',
		label: 'KDS-CHANNEL-SELECT',
		parameters: '[signal_type_1, signal_type_2...], ch_id'
	},
	{
		id: '#KDS-CHANNEL-SELECT?',
		label: 'KDS-CHANNEL-SELECT?',
		parameters: 'signal_type'
	},
	{
		id: '#KDS-DAISY-CHAIN',
		label: 'KDS-DAISY-CHAIN',
		parameters: 'daisy_mode'
	},
	{
		id: '#KDS-DAISY-CHAIN?',
		label: 'KDS-DAISY-CHAIN?',
		parameters: null
	},
	{
		id: '#KDS-DEFINE-CHANNEL',
		label: 'KDS-DEFINE-CHANNEL',
		parameters: 'ch_id'
	},
	{
		id: '#KDS-DEFINE-CHANNEL?',
		label: 'KDS-DEFINE-CHANNEL?',
		parameters: null
	},
	{
		id: '#KDS-GW-ETH',
		label: 'KDS-GW-ETH',
		parameters: 'gw_type, netw_id'
	},
	{
		id: '#KDS-GW-ETH?',
		label: 'KDS-GW-ETH?',
		parameters: 'gw_type'
	},
	{
		id: '#KDS-IR-GW',
		label: 'KDS-IR-GW',
		parameters: 'mode'
	},
	{
		id: '#KDS-IR-GW?',
		label: 'KDS-IR-GW?',
		parameters: null
	},
	{
		id: '#KDS-METHOD',
		label: 'KDS-METHOD',
		parameters: '1'
	},
	{
		id: '#KDS-METHOD?',
		label: 'KDS-METHOD?',
		parameters: null
	},
	{
		id: '#KDS-MULTICAST',
		label: 'KDS-MULTICAST',
		parameters: 'group_ip, ttl'
	},
	{
		id: '#KDS-OSD-DISPLAY',
		label: 'KDS-OSD-DISPLAY',
		parameters: 'mode'
	},
	{
		id: '#KDS-OSD-DISPLAY?',
		label: 'KDS-OSD-DISPLAY?',
		parameters: null
	},
	{
		id: '#KDS-RATIO?',
		label: 'KDS-RATIO?',
		parameters: null
	},
	{
		id: '#KDS-RESOL?',
		label: 'KDS-RESOL?',
		parameters: 'io_mode, io_index, is_native'
	},
	{
		id: '#KDS-SCALE',
		label: 'KDS-SCALE',
		parameters: 'value, res_type'
	},
	{
		id: '#KDS-SCALE?',
		label: 'KDS-SCALE?',
		parameters: null
	},
	{
		id: '#KDS-START-OVERLAY',
		label: 'KDS-START-OVERLAY',
		parameters: 'profile_name, time_limit'
	},
	{
		id: '#KDS-STOP-OVERLAY',
		label: 'KDS-STOP-OVERLAY',
		parameters: null
	},
	{
		id: '#KDS-VLAN-TAG',
		label: 'KDS-VLAN-TAG',
		parameters: 'gw_type, tag_id'
	},
	{
		id: '#KDS-VLAN-TAG?',
		label: 'KDS-VLAN-TAG?',
		parameters: 'gw_type'
	},
	{
		id: '#KDS-VW-BEZEL',
		label: 'KDS-VW-BEZEL',
		parameters: 'vw, ow, vh, oh'
	},
	{
		id: '#KDS-VW-BEZEL?',
		label: 'KDS-VW-BEZEL?',
		parameters: null
	},
	{
		id: '#KDS-VW-PATTERN',
		label: 'KDS-VW-PATTERN',
		parameters: 'mode'
	},
	{
		id: '#KDS-VW-PATTERN?',
		label: 'KDS-VW-PATTERN?',
		parameters: null
	},
	{
		id: '#LOCK-EDID',
		label: 'LOCK-EDID',
		parameters: 'in_index, lock_mode'
	},
	{
		id: '#LOCK-EDID?',
		label: 'LOCK-EDID?',
		parameters: 'in_index'
	},
	{
		id: '#LOCK-FP',
		label: 'LOCK-FP',
		parameters: 'lock/unlock'
	},
	{
		id: '#LOCK-FP?',
		label: 'LOCK-FP?',
		parameters: null
	},
	{
		id: '#LOG-ACTION',
		label: 'LOG-ACTION',
		parameters: 'action, period'
	},
	{
		id: '#LOG-TAIL?',
		label: 'LOG-TAIL?',
		parameters: 'line_num'
	},
	{
		id: '#LOGIN',
		label: 'LOGIN',
		parameters: 'login_level, password'
	},
	{
		id: '#LOGIN?',
		label: 'LOGIN?',
		parameters: null
	},
	{
		id: '#LOGOUT',
		label: 'LOGOUT',
		parameters: null
	},
	{
		id: '#LOGOUT-TIMEOUT',
		label: 'LOGOUT-TIMEOUT',
		parameters: 'time'
	},
	{
		id: '#LOGOUT-TIMEOUT?',
		label: 'LOGOUT-TIMEOUT?',
		parameters: null
	},
	{
		id: '#MODEL?',
		label: 'MODEL?',
		parameters: null
	},
	{
		id: '#NAME',
		label: 'NAME',
		parameters: 'interface_id,  host_name'
	},
	{
		id: '#NAME?',
		label: 'NAME?',
		parameters: 'interface_id'
	},
	{
		id: '#NAME-RST',
		label: 'NAME-RST',
		parameters: null
	},
	{
		id: '#NET-CONFIG',
		label: 'NET-CONFIG',
		parameters: 'netw_id, net_ip, net_mask, gateway, [dns1], [dns2]'
	},
	{
		id: '#NET-CONFIG?',
		label: 'NET-CONFIG?',
		parameters: 'netw_id'
	},
	{
		id: '#NET-DHCP',
		label: 'NET-DHCP',
		parameters: 'netw_id, dhcp_state'
	},
	{
		id: '#NET-DHCP?',
		label: 'NET-DHCP?',
		parameters: 'netw_id'
	},
	{
		id: '#NET-MAC?',
		label: 'NET-MAC?',
		parameters: 'id'
	},
	{
		id: '#NET-STAT?',
		label: 'NET-STAT?',
		parameters: null
	},
	{
		id: '#NET-IP?',
		label: 'NET-IP?',
		parameters: null
	},
	{
		id: '#PASS',
		label: 'PASS',
		parameters: 'login_level password'
	},
	{
		id: '#PASS?',
		label: 'PASS?',
		parameters: 'login_level'
	},
	{
		id: '#PORT-DIRECTION',
		label: 'PORT-DIRECTION',
		parameters: '<direction_type>.<port_format>.<port_index>.<signal_type>,  direction'
	},
	{
		id: '#PORT-DIRECTION?',
		label: 'PORT-DIRECTION?',
		parameters: '<direction_type>.<port_format>.<port_index>.<signal_type>'
	},
	{
		id: '#PORTS-LIST?',
		label: 'PORTS-LIST?',
		parameters: null
	},
	{
		id: '#RESET',
		label: 'RESET',
		parameters: null
	},
	{
		id: '#ROLLBACK',
		label: 'ROLLBACK',
		parameters: null
	},
	{
		id: '#SECUR',
		label: 'SECUR',
		parameters: 'security_state'
	},
	{
		id: '#SIGNALS-LIST?',
		label: 'SIGNALS-LIST?',
		parameters: null
	},
	{
		id: '#SN?',
		label: 'SN?',
		parameters: null
	},
	{
		id: '#STANDBY',
		label: 'STANDBY',
		parameters: 'value'
	},
	{
		id: '#STANDBY-TIMEOUT',
		label: 'STANDBY-TIMEOUT',
		parameters: 'time'
	},
	{
		id: '#STANDBY-TIMEOUT?',
		label: 'STANDBY-TIMEOUT?',
		parameters: null
	},
	{
		id: '#STANDBY-VERSION?',
		label: 'STANDBY-VERSION?',
		parameters: null
	},
	{
		id: '#TIME',
		label: 'TIME',
		parameters: 'day_of_week, date, data'
	},
	{
		id: '#TIME?',
		label: 'TIME?',
		parameters: null
	},
	{
		id: '#TIME-LOC',
		label: 'TIME-LOC',
		parameters: 'utc_off, dst_state'
	},
	{
		id: '#TIME-LOC?',
		label: 'TIME-LOC?',
		parameters: null
	},
	{
		id: '#TIME-SRV',
		label: 'TIME-SRV',
		parameters: 'mode, time_server_ip, sync_hour'
	},
	{
		id: '#TIME-SRV?',
		label: 'TIME-SRV?',
		parameters: null
	},
	{
		id: '#UART',
		label: 'UART',
		parameters: 'com_id, baud_rate, data_bits, parity, stop_bits_mode, serial_type, 485_term'
	},
	{
		id: '#UART?',
		label: 'UART?',
		parameters: 'com_id'
	},
	{
		id: '#UPG-TIME?',
		label: 'UPG-TIME?',
		parameters: null
	},
	{
		id: '#UPGRADE',
		label: 'UPGRADE',
		parameters: null
	},
	{
		id: '#VERSION?',
		label: 'VERSION?',
		parameters: null
	},
	{
		id: '#VIDEO-WALL-SETUP',
		label: 'VIDEO-WALL-SETUP',
		parameters: 'out_id, rotation'
	},
	{
		id: '#VIDEO-WALL-SETUP?',
		label: 'VIDEO-WALL-SETUP?',
		parameters: null
	},
	{
		id: '#VIEW-MOD',
		label: 'VIEW-MOD',
		parameters: 'mode'
	},
	{
		id: '#VIEW-MOD?',
		label: 'VIEW-MOD?',
		parameters: null
	},
	{
		id: '#WND-BEZEL',
		label: 'WND-BEZEL',
		parameters: 'mode, out_index, hv_value, switch, h_value, v_value, h_value, v_value'
	},
	{
		id: '#WND-BEZEL?',
		label: 'WND-BEZEL?',
		parameters: null
	},
	{
		id: '#WND-STRETCH',
		label: 'WND-STRETCH',
		parameters: 'out_index, mode'
	},
	{
		id: '#WND-STRETCH?',
		label: 'WND-STRETCH?',
		parameters: 'out_index'
	},
	{
		id: '#X-AUD-DESC?',
		label: 'X-AUD-DESC?',
		parameters: '<direction_type>.<port_format>.<port_index>'
	},
	{
		id: '#X-AUD-LVL',
		label: 'X-AUD-LVL',
		parameters: '<direction_type>.<port_format>.<port_index>.<signal_type>.<index>, audio_level'
	},
	{
		id: '#X-AUD-LVL?',
		label: 'X-AUD-LVL?',
		parameters: '<direction_type>.<port_format>.<port_index>.<signal_type>.<index>'
	},
	{
		id: '#X-AV-SW-MODE',
		label: 'X-AV-SW-MODE',
		parameters: '<direction_type>.<port_format>.<port_index>.<signal_type>.<index>, connection_mode'
	},
	{
		id: '#X-AV-SW-MODE?',
		label: 'X-AV-SW-MODE?',
		parameters: '<direction_type>.<port_format>.<port_index>.<signal_type>.<index>'
	},
	{
		id: '#X-MUTE',
		label: 'X-MUTE',
		parameters: '<direction_type>.<port_format>.<port_index>.<signal_type>.<index>, state'
	},
	{
		id: '#X-MUTE?',
		label: 'X-MUTE?',
		parameters: '<direction_type>.<port_format>.<port_index>.<signal_type>.<index>'
	},
	{
		id: '#X-PRIORITY',
		label: 'X-PRIORITY',
		parameters:
			'<direction_type>.<port_format>.<port_index>.<signal_type>, [<direction_type>.<port_format>.<port_index>.<signal_type> , ...]'
	},
	{
		id: '#X-PRIORITY?',
		label: 'X-PRIORITY?',
		parameters: '<direction_type>.<port_format>.<port_index>.<signal_type>'
	},
	{
		id: '#X-ROUTE',
		label: 'X-ROUTE',
		parameters:
			'[<direction_type1>.<port_type1>.<port_index1>.<signal_type1>.<index1>, ...], <direction_type2>.<port_type2>.<port_index2>.<signal_type2>.<index2>'
	},
	{
		id: '#X-ROUTE?',
		label: 'X-ROUTE?',
		parameters: '<direction_type1>.<port_type1>.<port_index1>.<signal_type1>.<index1>'
	}
]
