<script lang="ts">
import Theme from "./theme/theme.svelte";
import { Checkbox } from "./components/checkbox/";
import { IconClose } from "./components/icons";
import { Button, SplitButton } from "./components/button";
import Textfield from "@smui/textfield";
import { Label } from "@smui/button";
import SMUIButton from "@smui/button";
import Menu from "@smui/menu";
import IconButton from "@smui/icon-button";
import Dialog, { Header, Title, Content, Actions } from "@smui/dialog";
import List, { Item, Text } from "@smui/list";
import Snackbar from "@smui/snackbar";

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

function storedPlugins(): Plugin[] {
	return <Plugin[]>(
		JSON.parse(localStorage.getItem("plugins") ?? "[]", (key, value) => value)
	);
}

function withoutContent<P extends Plugin>(plugin: P): P {
	return { ...plugin, content: undefined };
}

function storePlugins(plugins: Array<Plugin>) {
	localStorage.setItem("plugins", JSON.stringify(plugins.map(withoutContent)));
}

function installExternalPlugin(plugin: Plugin) {
	const currentPlugins = storedPlugins();

	const pluginCopy = { ...plugin };
	pluginCopy.installed = true;
	currentPlugins.push(pluginCopy);

	const event = new CustomEvent("add-external-plugin", {
		bubbles: true,
		composed: true,
		detail: {
			pluginCopy,
		},
	});

	dispatchEvent(event);

	storePlugins(currentPlugins);
	localPlugins = currentPlugins;

	console.log("Installed external plugin:", plugin.name);
}

// Completely removes plugin from local browser cache.
function uninstallExternalPlugin(plugin: Plugin) {
	const currentPlugins = storedPlugins();
	const updatedPlugins = currentPlugins.filter((it) => it.name !== plugin.name);
	storePlugins(updatedPlugins);
	localPlugins = updatedPlugins;

	console.log("Uninstalled external plugin:", plugin.name);
}

// Enables/disables plugin by toggling the "installed" property.
function toggleOfficialPlugin(plugin: Plugin, isEnabled: boolean) {
	const currentPlugins = storedPlugins();
	const foundPlugin = currentPlugins.find((it) => it.name === plugin.name);
	if (foundPlugin) {
		foundPlugin.installed = isEnabled;
	}

	storePlugins(currentPlugins);
	localPlugins = currentPlugins;
	plugin.installed = isEnabled;
	notificationSnackbar.open();

	console.log("Set toggle state for", plugin.name);
}

let externalPlugins: Plugin[] = [];

async function fetchExternalPlugins() {
	const url =
		"https://raw.githubusercontent.com/sprinteins/oscd-plugin-store/refs/heads/main/public/plugins.json";

	const result = await fetch(url);
	const data = await result.json();
	externalPlugins = data.plugins;
}

fetchExternalPlugins();

let showOnlyInstalled = false;
let searchFilter = "";

function combineAllPlugins(local: Plugin[], external: Plugin[]): Plugin[] {
	const plugins: Plugin[] = [...local];

	for (let i = 0; i < externalPlugins.length; i++) {
		if (!localPlugins.some((it) => it.name === external[i].name)) {
			plugins.push(external[i]);
		}
	}

	plugins.sort((a, b) => {
		if (a.name < b.name) return -1;
		if (a.name > b.name) return 1;
		return 0;
	});

	return plugins;
}

function filterInstalledPlugins(plugin: Plugin, isChecked: boolean): boolean {
	return !isChecked || plugin.installed;
}

function filterSearchResults(plugin: Plugin, filter: string): boolean {
	return plugin.name.toLowerCase().includes(filter.toLowerCase());
}

// Prevent Plugin Store itself from showing up in search results.
function filterSelf(plugin: Plugin): boolean {
	return plugin.name !== "PluginStore" && plugin.name !== "Plugin Store";
}

let localPlugins = storedPlugins();
$: plugins = combineAllPlugins(localPlugins, externalPlugins);
$: filteredPlugins = plugins
	.filter((plugin) => filterInstalledPlugins(plugin, showOnlyInstalled))
	.filter((plugin) => filterSearchResults(plugin, searchFilter))
	.filter((plugin) => filterSelf(plugin));

// #endregion

// #region UI
let notificationSnackbar: Snackbar;

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
                    <Checkbox
                        label="Only Installed"
                        bind:checked={showOnlyInstalled}
                    />
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
                                    {getPluginAuthor(plugin)}
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
                    <Label>Refresh page to see changes.</Label>
                </Snackbar>
            </plugin-store>
        </Content>
        <Actions>
            <SMUIButton action="reject" on:click={() => location.reload()}>
                <Label>Restart</Label>
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
