import { AuthLevel } from "@modules/management/auth";
import { OrderConfig, SwitchConfig } from "@modules/command";
import { PluginSetting } from "@modules/plugin";

const manager: SwitchConfig = {
	type: "switch",
	mode: "divided",
	cmdKey: "adachi.manager",
	desc: [ "管理设置", "[qq]" ],
	header: "",
	regexp: [ "\\d+" ],
	onKey: "manager",
	offKey: "unmanaged",
	auth: AuthLevel.Master,
	main: "manager"
};

const ban: SwitchConfig = {
	type: "switch",
	mode: "divided",
	cmdKey: "adachi.ban",
	desc: [ "封禁用户", "[qq|群号]" ],
	header: "",
	regexp: [ "[ugUG]\\d+" ],
	onKey: "ban",
	offKey: "unban",
	auth: AuthLevel.Manager,
	main: "ban",
	detail: "qq和群号需使用标识符开头\n" +
			"qq的标识符为 u，群号为 g\n" +
			"例：u123456789 表示qq为 123456789 的用户"
};

const limit: SwitchConfig = {
	type: "switch",
	mode: "single",
	cmdKey: "adachi.limit",
	desc: [ "指令权限", "[qq|群号] [key] #{OPT}" ],
	header: "limit",
	onKey: "on",
	offKey: "off",
	regexp: [ "[ugUG]\\d+", "[.-\\w]+", "#{OPT}" ],
	auth: AuthLevel.Manager,
	main: "limit",
	detail: "qq和群号需使用标识符开头\n" +
			"qq的标识符为 u，群号为 g\n" +
			"例：g987654321 表示群号为 987654321 的群聊"
};

const interval: OrderConfig = {
	type: "order",
	cmdKey: "adachi.interval",
	desc: [ "操作冷却", "[qq|群号] [时间]" ],
	headers: [ "int" ],
	regexps: [ "[ugUG]\\d+", "\\d+" ],
	auth: AuthLevel.Manager,
	main: "interval",
	detail: "该命令用于设置群聊/私聊的指令操作触发间隔，时间的单位为毫秒\n" +
			"1秒=1000毫秒，不支持设置小数"
};

const refresh: OrderConfig = {
	type: "order",
	cmdKey: "adachi.hot-update-config",
	desc: [ "刷新配置", "" ],
	headers: [ "refresh" ],
	regexps: [],
	auth: AuthLevel.Master,
	main: "refresh",
	detail: "该指令用于重新加载在 /config 目录中的部分配置文件（setting 不会重新加载）"
}

const upgrade: OrderConfig = {
	type: "order",
	cmdKey: "adachi.hot-upgrade",
	desc: [ "更新服务", "" ],
	headers: [ "upgrade" ],
	regexps: [],
	auth: AuthLevel.Master,
	main: "upgrade",
	detail: "该指令会通过git更新代码，所以需要服务是通过git下载的。"
}

export async function init(): Promise<PluginSetting> {
	return {
		pluginName: "@management",
		cfgList: [ manager, ban, limit, interval, refresh, upgrade ]
	}
}