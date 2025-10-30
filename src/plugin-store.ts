export type Plugin = {
	name: string;
	author?: string;
	src: string;
	icon?: string;
	kind: PluginKind;
	requireDoc?: boolean;
	position?: MenuPosition;
	active: boolean;
	activeByDefault?: boolean;
	installed?: boolean; // legacy property, use 'active' instead
	official?: boolean;
	description?: string;
};

const menuPosition = ["top", "middle", "bottom"] as const;
export type PluginKind = "editor" | "menu" | "validator";
export type MenuPosition = (typeof menuPosition)[number];

export const pluginIcons: Record<PluginKind | MenuPosition, string> = {
	editor: 'tab',
	menu: 'play_circle',
	validator: 'rule_folder',
	top: 'play_circle',
	middle: 'play_circle',
	bottom: 'play_circle',
  }

export function getStoredPlugins(): Plugin[] {
    const plugins = <Plugin[]>(
		JSON.parse(localStorage.getItem("plugins") ?? "[]", (key, value) => value)
	);
	
	return plugins.map(plugin => {
		// If plugin has 'installed' but not 'active', use 'installed' value
		if (plugin.active === undefined && plugin.installed !== undefined) {
			plugin.active = plugin.installed;
		}
		// Ensure active is set (default to activeByDefault or false)
		if (plugin.active === undefined) {
			plugin.active = plugin.activeByDefault ?? false;
		}
		return plugin;
	});
}

export function savePluginsToLocalStorage(plugins: Plugin[]): void {
	localStorage.setItem("plugins", JSON.stringify(plugins));
}