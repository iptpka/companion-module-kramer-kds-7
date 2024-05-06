export const COMMANDS = [
    {
        command: "BEACON-EN",
        variables: "port_id, status, rate",
    },
    {
        command: "BEACON-INFO?",
        variables: "port_id",
    },
    {
        command: "BUILD-DATE?",
        variables: null,
    },
    {
        command: "CEC-GW-PORT-ACTIVE",
        variables: "gateway",
    },
    {
        command: "CEC-NTFY",
        variables: null,
    },
    {
        command: "CEC-SND",
        variables: "port_index, sn_id, cmd_name, cec_len, cec_command",
    },
    {
        command: "COM-ROUTE-ADD",
        variables: "com_id, port_type, port_id, eth_rep_en, timeout",
    },
    {
        command: "COM-ROUTE-REMOVE",
        variables: "com_id",
    },
    {
        command: "COM-ROUTE?",
        variables: "com_id",
    },
    {
        command: "CS-CONVERT",
        variables: "out_index, cs_mode",
    },
    {
        command: "CS-CONVERT?",
        variables: "out_index",
    },
    {
        command: "DEV-STATUS?",
        variables: null,
    },
    {
        command: "EDID-ACTIVE",
        variables: "Input_id,  Index",
    },
    {
        command: "EDID-ACTIVE?",
        variables: "Input_id",
    },
    {
        command: "EDID-LIST?",
        variables: null,
    },
    {
        command: "EDID-MODE",
        variables: "Input_id,  Mode,  Index",
    },
    {
        command: "EDID-MODE?",
        variables: "Input_id",
    },
    {
        command: "EDID-NET-SRC?",
        variables: "input_id",
    },
    {
        command: "EDID-NET-SRC",
        variables: "input_id,  src_ip",
    },
    {
        command: "EDID-RM",
        variables: "Index",
    },
    {
        command: "ETH-PORT",
        variables: "port_type, port_id",
    },
    {
        command: "ETH-PORT?",
        variables: "port_type",
    },
    {
        command: "FACTORY",
        variables: null,
    },
    {
        command: "GTW-MSG-NUM?",
        variables: "message_type, data",
    },
    {
        command: "HDCP-MOD",
        variables: "in_index, mode",
    },
    {
        command: "HDCP-MOD?",
        variables: "in_index",
    },
    {
        command: "HDCP-STAT?",
        variables: "io_mode, in_index",
    },
    {
        command: "HELP",
        variables: null,
    },
    {
        command: "HELP",
        variables: "cmd_name",
    },
    {
        command: "HW-TEMP?",
        variables: "region_id, mode",
    },
    {
        command: "HW-VERSION?",
        variables: null,
    },
    {
        command: "IDV",
        variables: null,
    },
    {
        command: "IR-SND",
        variables: "ir_index, sn_id, cmd_name, repeat_amount, total_packages, package_id, <pronto command...>",
    },
    {
        command: "KDS-ACTION",
        variables: "kds_mode",
    },
    {
        command: "KDS-ACTION?",
        variables: null,
    },
    {
        command: "KDS-AUD",
        variables: "mode",
    },
    {
        command: "KDS-AUD?",
        variables: null,
    },
    {
        command: "KDS-CHANNEL-SELECT",
        variables: "[signal_type_1, signal_type_2...], ch_id",
    },
    {
        command: "KDS-CHANNEL-SELECT?",
        variables: "signal_type",
    },
    {
        command: "KDS-DAISY-CHAIN",
        variables: "daisy_mode",
    },
    {
        command: "KDS-DAISY-CHAIN?",
        variables: null,
    },
    {
        command: "KDS-DEFINE-CHANNEL",
        variables: "ch_id",
    },
    {
        command: "KDS-DEFINE-CHANNEL?",
        variables: null,
    },
    {
        command: "KDS-GW-ETH",
        variables: "gw_type, netw_id",
    },
    {
        command: "KDS-GW-ETH?",
        variables: "gw_type",
    },
    {
        command: "KDS-IR-GW",
        variables: "mode",
    },
    {
        command: "KDS-IR-GW?",
        variables: null,
    },
    {
        command: "KDS-METHOD",
        variables: "1",
    },
    {
        command: "KDS-METHOD?",
        variables: null,
    },
    {
        command: "KDS-MULTICAST",
        variables: "group_ip, ttl",
    },
    {
        command: "KDS-OSD-DISPLAY",
        variables: "mode",
    },
    {
        command: "KDS-OSD-DISPLAY?",
        variables: null,
    },
    {
        command: "KDS-RATIO?",
        variables: null,
    },
    {
        command: "KDS-RESOL?",
        variables: "io_mode, io_index, is_native",
    },
    {
        command: "KDS-SCALE",
        variables: "value, res_type",
    },
    {
        command: "KDS-SCALE?",
        variables: null,
    },
    {
        command: "KDS-START-OVERLAY",
        variables: "profile_name, time_limit",
    },
    {
        command: "KDS-STOP-OVERLAY",
        variables: null,
    },
    {
        command: "KDS-VLAN-TAG",
        variables: "gw_type, tag_id",
    },
    {
        command: "KDS-VLAN-TAG?",
        variables: "gw_type",
    },
    {
        command: "KDS-VW-BEZEL",
        variables: "vw, ow, vh, oh",
    },
    {
        command: "KDS-VW-BEZEL?",
        variables: null,
    },
    {
        command: "KDS-VW-PATTERN",
        variables: "mode",
    },
    {
        command: "KDS-VW-PATTERN?",
        variables: null,
    },
    {
        command: "LOCK-EDID",
        variables: "in_index, lock_mode",
    },
    {
        command: "LOCK-EDID?",
        variables: "in_index",
    },
    {
        command: "LOCK-FP",
        variables: "lock/unlock",
    },
    {
        command: "LOCK-FP?",
        variables: null,
    },
    {
        command: "LOG-ACTION",
        variables: "action, period",
    },
    {
        command: "LOG-TAIL?",
        variables: "line_num",
    },
    {
        command: "LOGIN",
        variables: "login_level, password",
    },
    {
        command: "LOGIN?",
        variables: null,
    },
    {
        command: "LOGOUT",
        variables: null,
    },
    {
        command: "LOGOUT-TIMEOUT",
        variables: "time",
    },
    {
        command: "LOGOUT-TIMEOUT?",
        variables: null,
    },
    {
        command: "MODEL?",
        variables: null,
    },
    {
        command: "NAME",
        variables: "interface_id,  host_name",
    },
    {
        command: "NAME?",
        variables: "interface_id",
    },
    {
        command: "NAME-RST",
        variables: null,
    },
    {
        command: "NET-CONFIG",
        variables: "netw_id, net_ip, net_mask, gateway, [dns1], [dns2]",
    },
    {
        command: "NET-CONFIG?",
        variables: "netw_id",
    },
    {
        command: "NET-DHCP",
        variables: "netw_id, dhcp_state",
    },
    {
        command: "NET-DHCP?",
        variables: "netw_id",
    },
    {
        command: "NET-MAC?",
        variables: "id",
    },
    {
        command: "NET-STAT?",
        variables: null,
    },
    {
        command: "NET-IP?",
        variables: null,
    },
    {
        command: "PASS",
        variables: "login_level password",
    },
    {
        command: "PASS?",
        variables: "login_level",
    },
    {
        command: "PORT-DIRECTION",
        variables: "<direction_type>.<port_format>.<port_index>.<signal_type>,  direction",
    },
    {
        command: "PORT-DIRECTION?",
        variables: "<direction_type>.<port_format>.<port_index>.<signal_type>",
    },
    {
        command: "PORTS-LIST?",
        variables: null,
    },
    {
        command: "RESET",
        variables: null,
    },
    {
        command: "ROLLBACK",
        variables: null,
    },
    {
        command: "SECUR",
        variables: "security_state",
    },
    {
        command: "SIGNALS-LIST?<LF>",
        variables: null,
    },
    {
        command: "SN?",
        variables: null,
    },
    {
        command: "STANDBY",
        variables: "value",
    },
    {
        command: "STANDBY-TIMEOUT",
        variables: "time",
    },
    {
        command: "STANDBY-TIMEOUT?",
        variables: null,
    },
    {
        command: "STANDBY-VERSION?",
        variables: null,
    },
    {
        command: "TIME",
        variables: "day_of_week, date, data",
    },
    {
        command: "TIME?",
        variables: null,
    },
    {
        command: "TIME-LOC",
        variables: "utc_off, dst_state",
    },
    {
        command: "TIME-LOC?",
        variables: null,
    },
    {
        command: "TIME-SRV",
        variables: "mode, time_server_ip, sync_hour",
    },
    {
        command: "TIME-SRV?",
        variables: null,
    },
    {
        command: "UART",
        variables: "com_id, baud_rate, data_bits, parity, stop_bits_mode, serial_type, 485_term",
    },
    {
        command: "UART?",
        variables: "com_id",
    },
    {
        command: "UPG-TIME?",
        variables: null,
    },
    {
        command: "UPGRADE",
        variables: null,
    },
    {
        command: "VERSION?",
        variables: null,
    },
    {
        command: "VIDEO-WALL-SETUP",
        variables: "out_id, rotation",
    },
    {
        command: "VIDEO-WALL-SETUP?",
        variables: "out_id",
    },
    {
        command: "VIEW-MOD",
        variables: "mode",
    },
    {
        command: "VIEW-MOD?",
        variables: null,
    },
    {
        command: "WND-BEZEL",
        variables: "mode, out_index, hv_value, switch, h_value, v_value, h_value, v_value",
    },
    {
        command: "WND-BEZEL?",
        variables: null,
    },
    {
        command: "WND-STRETCH",
        variables: "out_index, mode",
    },
    {
        command: "WND-STRETCH?",
        variables: "out_index",
    },
    {
        command: "X-AUD-DESC?",
        variables: "<direction_type>.<port_format>.<port_index>",
    },
    {
        command: "X-AUD-LVL",
        variables: "<direction_type>.<port_format>.<port_index>.<signal_type>.<index>, audio_level",
    },
    {
        command: "X-AUD-LVL?",
        variables: "<direction_type>.<port_format>.<port_index>.<signal_type>.<index>",
    },
    {
        command: "X-AV-SW-MODE",
        variables: "<direction_type>.<port_format>.<port_index>.<signal_type>.<index>, connection_mode",
    },
    {
        command: "X-AV-SW-MODE?<direction_type>.<port_format>.<port_index>.<signal_type>.",
        variables: "<index>",
    },
    {
        command: "X-MUTE",
        variables: "<direction_type>.<port_format>.<port_index>.<signal_type>.<index>, state",
    },
    {
        command: "X-MUTE?",
        variables: "<direction_type>.<port_format>.<port_index>.<signal_type>.<index>",
    },
    {
        command: "X-PRIORITY",
        variables: "<direction_type>.<port_format>.<port_index>.<signal_type>, [<direction_type>.<port_format>.<port_index>.<signal_type> , ...]",
    },
    {
        command: "X-PRIORITY?",
        variables: "<direction_type>.<port_format>.<port_index>.<signal_type>",
    },
    {
        command: "X-ROUTE",
        variables: "[<direction_type1>.<port_type1>.<port_index1>.<signal_type1>.<index1>, ...], <direction_type2>.<port_type2>.<port_index2>.<signal_type2>.<index2>",
    },
    {
        command: "X-ROUTE?",
        variables: "<direction_type1>.<port_type1>.<port_index1>.<signal_type1>.<index1>",
    }
]