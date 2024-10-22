<script lang="ts">
import Theme from "./theme/theme.svelte";
import { Checkbox } from "./components/checkbox/";
import Textfield from "@smui/textfield";
import Button, { Group, GroupItem, Label } from "@smui/button";
import Menu from "@smui/menu";
import IconButton from "@smui/icon-button";
import Dialog, { Header, Title, Content, Actions } from "@smui/dialog";
import List, { Item, Text } from "@smui/list";
import Snackbar from "@smui/snackbar";
import IconArrowDropDown from "./components/icons/icon-arrow-drop-down.svelte";
import IconClose from "./components/icons/icon-close.svelte";

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

function combineAllPlugins(local: Plugin[]): Plugin[] {
	const plugins: Plugin[] = [...local];

	for (let i = 0; i < externalPlugins.length; i++) {
		if (!localPlugins.some((it) => it.name === externalPlugins[i].name)) {
			plugins.push(externalPlugins[i]);
		}
	}

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
$: plugins = combineAllPlugins(localPlugins);
$: filteredPlugins = plugins
	.filter((plugin) => filterInstalledPlugins(plugin, showOnlyInstalled))
	.filter((plugin) => filterSearchResults(plugin, searchFilter))
	.filter((plugin) => filterSelf(plugin));

// #endregion

// #region UI
let notificationSnackbar: Snackbar;

let currentPluginAnchor: Element;
let menus: Menu[];
$: menus = filteredPlugins.map(() => null);
$: menuStates = filteredPlugins.map(() => false);

function openPluginMenu(e, index: number) {
	currentPluginAnchor = e.currentTarget;
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
                                <Group variant="raised">
                                    {#if plugin.official}
                                        <Button
                                            on:click={() =>
                                                toggleOfficialPlugin(
                                                    plugin,
                                                    false
                                                )}
                                            variant="outlined"
                                            style="min-width: 148px;"
                                        >
                                            <Label>Disable</Label>
                                        </Button>
                                    {:else}
                                        <Button
                                            on:click={() =>
                                                toggleOfficialPlugin(
                                                    plugin,
                                                    false
                                                )}
                                            variant="outlined"
                                            style="min-width: 102px;"
                                        >
                                            <Label>Disable</Label>
                                        </Button>
                                        <div use:GroupItem>
                                            <Button
                                                on:click={(e) =>
                                                    openPluginMenu(e, index)}
                                                variant="outlined"
                                                style="min-width: 18px;"
                                            >
                                                <IconArrowDropDown />
                                            </Button>
                                            <Menu
                                                bind:this={menus[index]}
                                                anchorElement={currentPluginAnchor}
                                                open={menuStates[index]}
                                                anchorCorner="BOTTOM_LEFT"
                                                style="left: -70px"
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
                                        </div>
                                    {/if}
                                </Group>
                            {:else if plugin.official}
                                <Button
                                    on:click={() =>
                                        toggleOfficialPlugin(plugin, true)}
                                    variant="raised"
                                    style="min-width: 148px;"
                                >
                                    <Label>Enable</Label>
                                </Button>
                            {:else}
                                {#if localPlugins.includes(plugin)}
                                    <Group variant="raised">
                                        <Button
                                            on:click={() =>
                                                toggleOfficialPlugin(
                                                    plugin,
                                                    true
                                                )}
                                            variant="raised"
                                            style="min-width: 102px;"
                                        >
                                            <Label>Enable</Label>
                                        </Button>
                                        <Button
                                            on:click={(e) =>
                                                openPluginMenu(e, index)}
                                            variant="raised"
                                            style="min-width: 18px;"
                                        >
                                            <IconArrowDropDown />
                                        </Button>
                                        <Menu
                                            bind:this={menus[index]}
                                            anchorElement={currentPluginAnchor}
                                            open={menuStates[index]}
                                            anchorCorner="BOTTOM_LEFT"
                                            style="left: -70px"
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
                                    </Group>
                                {:else}
                                <Button
                                    on:click={() =>
                                        installExternalPlugin(plugin)}
                                    variant="raised"
                                    style="min-width: 148px;"
                                >
                                    <Label>Install</Label>
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
            <Button action="reject" on:click={() => location.reload()}>
                <Label>Restart</Label>
            </Button>
            <Button action="accept">
                <Label>Close</Label>
            </Button>
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
