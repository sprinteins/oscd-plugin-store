export type Plugin = {
	name: string
	author?: string
	src: string
	icon?: string
	kind: PluginKind
	requireDoc?: boolean
	position?: MenuPosition
	active: boolean
	activeByDefault?: boolean
	official?: boolean
	description?: string
}

const menuPosition = ['top', 'middle', 'bottom'] as const
export type PluginKind = 'editor' | 'menu' | 'validator'
export type MenuPosition = (typeof menuPosition)[number]

export const pluginIcons: Record<PluginKind | MenuPosition, string> = {
	editor: 'tab',
	menu: 'play_circle',
	validator: 'rule_folder',
	top: 'play_circle',
	middle: 'play_circle',
	bottom: 'play_circle'
}

export function getStoredPlugins(): Plugin[] {
	return <Plugin[]>(
		JSON.parse(
			localStorage.getItem('plugins') ?? '[]',
			(key, value) => value
		)
	)
}
