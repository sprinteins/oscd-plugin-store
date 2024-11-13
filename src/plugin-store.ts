export type Plugin = {
	name: string;
	author?: string;
	src: string;
	icon?: string;
	kind: PluginKind;
	requireDoc?: boolean;
	position?: MenuPosition;
	installed: boolean;
	official?: boolean;
	description?: string;
};

const menuPosition = ["top", "middle", "bottom"] as const;
export type PluginKind = "editor" | "menu" | "validator";
export type MenuPosition = (typeof menuPosition)[number];

export function getStoredPlugins(): Plugin[] {
    return <Plugin[]>(
		JSON.parse(localStorage.getItem("plugins") ?? "[]", (key, value) => value)
	);
}