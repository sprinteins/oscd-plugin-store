<script lang="ts">
import Theme from "./theme/theme.svelte";
import { IconClose } from "./components/icons";
import { Button, SplitButton } from "./components/button";
import Textfield from "@smui/textfield";
import { Label } from "@smui/button";
import Switch from "@smui/switch";
import SMUIButton from "@smui/button";
import Menu from "@smui/menu";
import IconButton from "@smui/icon-button";
import Dialog, { Header, Title, Content, Actions } from "@smui/dialog";
import List, { Item, Text } from "@smui/list";
import Snackbar from "@smui/snackbar";
import { plugins as externalPlugins } from "../public/plugins.json";

const isRestricted = !import.meta.env.VITE_EXTERNAL_PLUGINS === true;

export let isOpen: boolean;

// #region Plugin

type PluginKind = "editor" | "menu" | "validator";
const menuPosition = ["top", "middle", "bottom"] as const;
type MenuPosition = (typeof menuPosition)[number];

type Plugin = {
	name: string;
	author?: string;
	src: string;
	icon?: string;
	kind: PluginKind;
	requireDoc?: boolean;
	position?: MenuPosition;
	installed: boolean;
	official?: boolean;
};

type ConfigurePluginDetail = {
	name: string;
	// The API describes only 'menu' and 'editor' kinds
	// but we still use the 'validator' too, so I just use the type PluginKind
	kind: PluginKind;
	config: Plugin | null;
};

function storedPlugins(): Plugin[] {
	return <Plugin[]>(
		JSON.parse(localStorage.getItem("plugins") ?? "[]", (key, value) => value)
	);
}

function installExternalPlugin(plugin: Plugin) {
	const currentPlugins = storedPlugins();

	const pluginCopy = { ...plugin };
	pluginCopy.installed = true;
	currentPlugins.push(pluginCopy);

	localPlugins = currentPlugins;

	dispatchConfigurePlugin(pluginCopy);
	console.log("Installed external plugin:", plugin.name);
}

// Completely removes plugin from local browser cache.
function uninstallExternalPlugin(plugin: Plugin) {
	const currentPlugins = storedPlugins();
	const updatedPlugins = currentPlugins.filter((it) => it.name !== plugin.name);
	localPlugins = updatedPlugins;

	dispatchConfigurePlugin(plugin, true);
	console.log("Uninstalled external plugin:", plugin.name);
}

// Enables/disables plugin by toggling the "installed" property.
function toggleOfficialPlugin(plugin: Plugin, isEnabled: boolean) {
	const currentPlugins = storedPlugins();
	const foundPlugin = currentPlugins.find((it) => it.name === plugin.name);
	if (foundPlugin) {
		foundPlugin.installed = isEnabled;
	}

	localPlugins = currentPlugins;
	plugin.installed = isEnabled;
	notificationSnackbar.open();

	dispatchConfigurePlugin(plugin);
	console.log("Set toggle state for", plugin.name);
}

function dispatchConfigurePlugin(plugin: Plugin, shouldDelete = false) {
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

	dispatchEvent(event);
}

let showOnlyInstalled = false;
let searchFilter = "";

function combineAllPlugins(local: Plugin[], external: Plugin[]): Plugin[] {
	const plugins = [...local];

	if (!isRestricted) {
		for (const plugin of external) {
			if (!localPlugins.some((it) => it.name === plugin.name)) {
				plugins.push(plugin);
			}
		}
	}

	plugins.sort((a, b) => {
		if (a.author && b.author && a.author !== b.author) {
			return a.author?.localeCompare(b.author);
		}

		return a.name.localeCompare(b.name);
	});

	return plugins;
}

function filterInstalledPlugins(plugin: Plugin, isChecked: boolean): boolean {
	return !isChecked || localPlugins.includes(plugin);
}

function filterSearchResults(plugin: Plugin, filter: string): boolean {
	const search = filter.toLowerCase();

	const foundName = plugin.name.toLowerCase().includes(search);
	let foundAuthor = false;

	if (plugin.author) {
		foundAuthor = plugin.author.toLowerCase().includes(search);
	}

	return foundName || foundAuthor;
}

// Prevent Plugin Store itself from showing up in search results.
function filterSelf(plugin: Plugin): boolean {
	return plugin.name !== "PluginStore" && plugin.name !== "Plugin Store";
}

let localPlugins = storedPlugins();
$: plugins = combineAllPlugins(localPlugins, externalPlugins as Plugin[]);
$: filteredPlugins = plugins
	.filter((plugin) => filterInstalledPlugins(plugin, showOnlyInstalled))
	.filter((plugin) => filterSearchResults(plugin, searchFilter))
	.filter((plugin) => filterSelf(plugin));

// #endregion

// #region UI
let notificationSnackbar: Snackbar;

let isDirty = false;

let menus: Menu[];
$: menus = filteredPlugins.map(() => null);
$: menuStates = filteredPlugins.map(() => false);

function openPluginMenu(index: number) {
	menuStates = menuStates.map(() => false);
	menuStates[index] = true;
}

function alternateRowColors(index: number) {
	return `background: rgba(0, 0, 0, ${index % 2 === 0 ? "0" : "0.03"});`;
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

function getPluginAuthor(plugin: Plugin) {
	return plugin.official ? "Built-in" : plugin.author;
}

function getPluginSource(plugin: Plugin) {
	return plugin.src;
}

// #endregion
</script>

<Theme>
    <Dialog
        bind:open={isOpen}
        fullscreen
        surface$style="width: 850px; max-width: calc(100vw - 32px);"
        aria-labelledby="plugin-store-title"
        aria-describedby="plugin-store-content"
    >
        <Header>
            <Title id="plugin-store-title">Plugin Store</Title>
            <IconButton class="material-icons" action="close">
                <IconClose />
            </IconButton>
        </Header>
        <Content id="plugin-store-content">
            <plugin-store>
                <plugin-store-toolbar>
                    <plugin-store-filters--switch>
                        <Switch
                            bind:checked={showOnlyInstalled}
                            style="margin: 0;"
                        />
                        <Label>Only Installed</Label>  
                    </plugin-store-filters--switch>
                    <Textfield
                        label={"Search"}
                        variant={"outlined"}
                        bind:value={searchFilter}
                    />
                </plugin-store-toolbar>
                <plugin-store-items>
                    {#each filteredPlugins as plugin, index}
                        <plugin-store-item style={alternateRowColors(index)}>
                            <plugin-store-item-meta>
                                <div class="mdc-typography--caption">
                                    {getTagline(plugin)}
                                </div>
                                <div class="mdc-typography--body1">
                                    <strong>{plugin.name}</strong>
                                </div>
                                <div class="mdc-typography--caption">
                                    {getPluginSource(plugin)}
                                </div>
                            </plugin-store-item-meta>
                            {#if plugin.installed}
                                    {#if plugin.official}
                                        <Button variant="outlined" on:click={() => toggleOfficialPlugin(plugin, false)}>
                                            Disable
                                        </Button>
                                    {:else}
                                        <SplitButton variant="outlined" label="Disable" on:click={() => toggleOfficialPlugin(plugin, false)} on:menuOpen={() => openPluginMenu(index)}>
                                            <Menu
                                                bind:this={menus[index]}
                                                open={menuStates[index]}
                                                anchorCorner="BOTTOM_LEFT"
                                                style="left: -70px;"
                                            >
                                                <List>
                                                    <Item
                                                        on:SMUI:action={() =>
                                                            uninstallExternalPlugin(
                                                                plugin
                                                            )}
                                                    >
                                                        <Text>Uninstall</Text>
                                                    </Item>
                                                </List>
                                            </Menu>
                                        </SplitButton>
                                    {/if}
                            {:else if plugin.official}
                            <Button on:click={() => toggleOfficialPlugin(plugin, true)}>
                                Enable
                            </Button>
                            {:else}
                                {#if localPlugins.includes(plugin)}
                                    <SplitButton label="Enable" on:click={() => {toggleOfficialPlugin(plugin, true)}} on:menuOpen={() => openPluginMenu(index)}>
                                        <Menu
                                            bind:this={menus[index]}
                                            open={menuStates[index]}
                                            anchorCorner="BOTTOM_LEFT"
                                            style="left: -70px;"
                                        >
                                            <List>
                                                <Item
                                                    on:SMUI:action={() =>
                                                        uninstallExternalPlugin(
                                                            plugin
                                                        )}
                                                >
                                                    <Text>Uninstall</Text>
                                                </Item>
                                            </List>
                                        </Menu>
                                    </SplitButton>
                                {:else}
                                <Button on:click={() => installExternalPlugin(plugin)}>
                                    Install
                                </Button>
                                {/if}
                            {/if}
                        </plugin-store-item>
                    {/each}
                    {#if filteredPlugins.length === 0}
                        <div class="mdc-typography--body2">
                            No plugins found.
                        </div>
                    {/if}
                </plugin-store-items>
                <Snackbar bind:this={notificationSnackbar}>
                    <Label>Reload app to see changes.</Label>
                </Snackbar>
            </plugin-store>
        </Content>
        <Actions>
            <SMUIButton action="reject" disabled={!isDirty} on:click={() => location.reload()}>
                <Label>Reload App</Label>
            </SMUIButton>
            <SMUIButton action="accept">
                <Label>Close</Label>
            </SMUIButton>
        </Actions>
    </Dialog>
</Theme>

<style>
    :root,
    :host {
        --header-height: 128px;
    }
    plugin-store {
        height: calc(100vh - var(--header-height));
        display: flex;
        flex-direction: column;
        align-items: stretch;
        position: relative;
    }
    plugin-store-toolbar {
        display: flex;
        justify-content: space-between;
        place-items: center;
        margin-top: 1rem;
    }
    plugin-store-filters--switch {
        display: flex;
        place-items: center;
        gap: 0.8rem;
    }
    plugin-store-items {
        display: flex;
        flex-direction: column;
        padding: 1rem 0;
    }
    plugin-store-item {
        display: flex;
        justify-content: space-between;
        place-items: center;
        padding: 20px 24px;
        margin: 0 -24px;
    }
    plugin-store-item-meta {
        display: flex;
        flex-direction: column;
        gap: 1px;
    }
</style>
