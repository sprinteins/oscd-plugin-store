<script lang="ts">
import Menu from "@smui/menu";
import { Button, SplitButton } from "./components/button";
import List, { Item, Text } from "@smui/list";
import { getStoredPlugins, savePluginsToLocalStorage, pluginIcons, type Plugin, type PluginKind } from "./plugin-store";

type ConfigurePluginDetail = {
	name: string;
	// The API describes only 'menu' and 'editor' kinds
	// but we still use the 'validator' too, so I just use the type PluginKind
	kind: PluginKind;
	config: Plugin | null;
};

    interface Props {
        filteredPlugins: Plugin[];
        pluginStore: Element | undefined;
        plugin: Plugin;
        index: number;
        localPlugins: Plugin[];
    }

    let {
        filteredPlugins,
        pluginStore,
        plugin,
        index,
        localPlugins = $bindable()
    }: Props = $props();

function dispatchConfigurePlugin(plugin: Plugin, shouldDelete = false) {
	if (!pluginStore) return;
	
	const event = new CustomEvent<ConfigurePluginDetail>(
		"oscd-configure-plugin",
		{
			bubbles: true,
			composed: true,
			detail: {
				name: plugin.name,
				kind: plugin.kind,
				config: shouldDelete ? null : plugin,
			},
		},
	);

	pluginStore.dispatchEvent(event);
}

function installExternalPlugin(plugin: Plugin) {
	const currentPlugins = getStoredPlugins();

	const pluginCopy = { ...plugin };
	pluginCopy.active = true;
	currentPlugins.push(pluginCopy);

	savePluginsToLocalStorage(currentPlugins);
	localPlugins = currentPlugins; 

	dispatchConfigurePlugin(pluginCopy);
	console.log("Installed external plugin:", plugin.name);
}

// Completely removes plugin from local browser cache.
function uninstallExternalPlugin(plugin: Plugin) {
	const currentPlugins = getStoredPlugins();
	const updatedPlugins = currentPlugins.filter((it) => it.name !== plugin.name);
	
	savePluginsToLocalStorage(updatedPlugins);
	localPlugins = updatedPlugins;

	dispatchConfigurePlugin(plugin, true);
	console.log("Uninstalled external plugin:", plugin.name);
}

// Enables/disables plugin by toggling the "active" property.
function toggleOfficialPlugin(plugin: Plugin, isEnabled: boolean) {
	const currentPlugins = getStoredPlugins();
	const foundPlugin = currentPlugins.find((it) => it.name === plugin.name);
	if (foundPlugin) {
		foundPlugin.active = isEnabled;
	} else if (isEnabled) {
		const pluginCopy = { ...plugin };
		pluginCopy.active = isEnabled;
		currentPlugins.push(pluginCopy);
	}

	savePluginsToLocalStorage(currentPlugins);
	localPlugins = currentPlugins;
	plugin.active = isEnabled;

	dispatchConfigurePlugin(plugin);
	console.log("Set toggle state for", plugin.name);
}

let menus: (Menu | null)[] = $state([]);
let menuStates = $state<boolean[]>([]);

// Update arrays when filteredPlugins changes
$effect(() => {
	menus = filteredPlugins.map(() => null);
	menuStates = filteredPlugins.map(() => false);
});

function openPluginMenu(index: number) {
	menuStates = menuStates.map(() => false);
	menuStates[index] = true;
}

function convertPluginKindToText(kind: PluginKind): string {
	if (kind === undefined) {
		return "";
	}

	const capitalized = kind.toString()[0].toUpperCase() + kind.substring(1);
	return capitalized;
}
function getTagline(plugin: Plugin) {
	return `${getPluginAuthor(plugin)} · ${convertPluginKindToText(plugin.kind)}`;
}

function getPluginSource(plugin: Plugin) {
	return plugin.src;
}

function getPluginAuthor(plugin: Plugin) {
	return plugin.official ? "Built-in" : plugin.author;
}

function getPluginDescription(plugin: Plugin) {
	return plugin.description || "";
}

function getPluginIcon(plugin: Plugin) {
    return plugin.icon || pluginIcons[plugin.kind];
}
</script>

<plugin-store-item>
    <plugin-store-item-meta>
        <plugin-store-item-meta--icon>
            <mwc-icon>{getPluginIcon(plugin)}</mwc-icon>
        </plugin-store-item-meta--icon>
        <plugin-store-item-meta--wrapper>
            <div class="mdc-typography--caption">
                {getTagline(plugin)}
            </div>
            <div class="mdc-typography--body1">
                <strong>{plugin.name}</strong>
            </div>
            <plugin-store-item-meta--source class="mdc-typography--caption">
                {getPluginSource(plugin)}
            </plugin-store-item-meta--source>
            <div class="mdc-typography--caption plugin-store-item--description">
                <div title={getPluginDescription(plugin)}>
                    {getPluginDescription(plugin)}
                </div>
            </div>
        </plugin-store-item-meta--wrapper>
    </plugin-store-item-meta>
    {#if plugin.active}
        {#if plugin.official}
            <Button variant="outlined" onclick={() => toggleOfficialPlugin(plugin, false)}>
                Disable
            </Button>
        {:else}
            <SplitButton variant="outlined" label="Disable" onclick={() => toggleOfficialPlugin(plugin, false)} onmenuOpen={() => openPluginMenu(index)}>
                <Menu bind:this={menus[index]} open={menuStates[index]} anchorCorner="BOTTOM_LEFT" style="left: -70px;">
                    <List>
                        <Item onSMUIAction={() => uninstallExternalPlugin(plugin)}>
                            <Text>Uninstall</Text>
                        </Item>
                    </List>
                </Menu>
            </SplitButton>
        {/if}
    {:else if plugin.official}
        <Button onclick={() => toggleOfficialPlugin(plugin, true)}>
            Enable
        </Button>
    {:else}
        {#if localPlugins.some(p => p.name === plugin.name)}
            <SplitButton label="Enable" onclick={() => {toggleOfficialPlugin(plugin, true)}} onmenuOpen={() => openPluginMenu(index)}>
                <Menu bind:this={menus[index]} open={menuStates[index]} anchorCorner="BOTTOM_LEFT" style="left: -70px;">
                    <List>
                        <Item onSMUIAction={() => uninstallExternalPlugin(plugin)}>
                            <Text>Uninstall</Text>
                        </Item>
                    </List>
                </Menu>
            </SplitButton>
        {:else}
            <Button onclick={() => installExternalPlugin(plugin)}>
                Install
            </Button>
        {/if}
    {/if}
</plugin-store-item>
<style>
    plugin-store-item {
        display: flex;
        justify-content: space-between;
        place-items: center;
        padding: 20px 24px;
        margin: 0 -24px;
    }
    plugin-store-item:nth-child(odd) {
        background: rgba(0, 0, 0, 0.03);
    }
    plugin-store-item-meta {
        display: flex;
        gap: 1.5em; 
        width: 100%;
    }
    plugin-store-item-meta--icon {
        display: flex;
        place-items: center;
        justify-content: center;

        width: 100%;
        max-width: 2em;

        pointer-events: none;
        user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
    }
    plugin-store-item-meta--wrapper {
        display: flex;
        flex-direction: column;
        gap: 1px;
        width: 100%;
    }
    plugin-store-item-meta--source {
        opacity: 0.65;
    }
    .plugin-store-item--description {
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        padding-right: 2em;
    }
</style>