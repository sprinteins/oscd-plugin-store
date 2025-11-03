<script lang="ts">
import Theme from "./theme/theme.svelte";
import { IconClose } from "./components/icons";
import Textfield from "@smui/textfield";
import { Label } from "@smui/button";
import Switch from "@smui/switch";
import SMUIButton from "@smui/button";
import IconButton from "@smui/icon-button";
import Dialog, { Header, Title, Content, Actions } from "@smui/dialog";
import { plugins as externalPlugins } from "../public/plugins.json";
import PluginStoreItem from "./plugin-store-item.svelte";
import type { Plugin } from "./plugin-store";
import { getStoredPlugins as storedPlugins } from "./plugin-store";

const isRestricted = !import.meta.env.VITE_EXTERNAL_PLUGINS === true;
interface Props {
    isOpen: boolean;
}

let { isOpen = $bindable() }: Props = $props();

let showOnlyInstalled = $state(false);
let searchFilter = $state("");

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
	if (!isChecked) return true;
	return localPlugins.some(p => p.name === plugin.name && p.active);
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

let localPlugins = $state(storedPlugins());
let plugins = $derived(combineAllPlugins(localPlugins, externalPlugins as Plugin[]));
let filteredPlugins = $derived(plugins
	.filter((plugin) => filterInstalledPlugins(plugin, showOnlyInstalled))
	.filter((plugin) => filterSearchResults(plugin, searchFilter))
	.filter((plugin) => filterSelf(plugin)));

let editorPlugins = $derived(filteredPlugins.filter((it) => it.kind === "editor"));
let menuPlugins = $derived(filteredPlugins.filter((it) => it.kind === "menu"));
let validatorPlugins = $derived(filteredPlugins.filter((it) => it.kind === "validator"));

//#region UI

let pluginStore: Element | undefined = $state();

function openPluginDownloadUI() {
    pluginStore?.dispatchEvent(new Event("open-plugin-download", {
        composed: true, 
        bubbles: true
    }));
}

//#endregion

$effect(() => {
    const handleAddExternalPlugin = () => {
        localPlugins = storedPlugins();
    };
    
    document.addEventListener('add-external-plugin', handleAddExternalPlugin);
    
    return () => {
        document.removeEventListener('add-external-plugin', handleAddExternalPlugin);
    };
});

</script>
<Theme>
    <Dialog
        bind:open={isOpen}
        fullscreen
        surface$style="width: 850px; max-width: calc(100vw - 32px);"
        aria-labelledby="plugin-store-header--title"
        aria-describedby="plugin-store-content"
    >
        <Header class="plugin-store-header">
            <plugin-store-header--top>
                <Title id="plugin-store-header--title">Plugin Store</Title>
                <IconButton class="material-icons" action="close">
                    <IconClose />
                </IconButton>
            </plugin-store-header--top>
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
        </Header>
        <Content id="plugin-store-content">
            <plugin-store bind:this={pluginStore}>
                <plugin-store-items>
                    <plugin-store-items--category style="margin-top: 0;">
                        <strong><div class="mdc-typography--headline6 plugin-store-items--category-title">Editor</div></strong>
                        <hr class="plugin-store-items--divider">
                    </plugin-store-items--category>
                    {#each editorPlugins as plugin}
                        <PluginStoreItem 
                         plugin={plugin}
                         bind:localPlugins={localPlugins} 
                         pluginStore={pluginStore}/> 
                    {/each}
                    {#if editorPlugins.length === 0}
                        <div class="mdc-typography--body2" style="margin-top: 1em;">
                            No plugins found.
                        </div>
                    {/if}
                    <plugin-store-items--category>
                        <strong><div class="mdc-typography--headline6 plugin-store-items--category-title">Menu</div></strong>
                        <hr class="plugin-store-items--divider">
                    </plugin-store-items--category>
                    {#each menuPlugins as plugin}
                        <PluginStoreItem 
                         plugin={plugin}
                         bind:localPlugins={localPlugins} 
                         pluginStore={pluginStore}/> 
                    {/each}
                    {#if menuPlugins.length === 0}
                        <div class="mdc-typography--body2" style="margin-top: 1em;">
                            No plugins found.
                        </div>
                    {/if}
                    <plugin-store-items--category>
                        <strong><div class="mdc-typography--headline6 plugin-store-items--category-title">Validator</div></strong>
                        <hr class="plugin-store-items--divider">
                    </plugin-store-items--category>
                    {#each validatorPlugins as plugin}
                        <PluginStoreItem 
                         plugin={plugin}
                         bind:localPlugins={localPlugins} 
                         pluginStore={pluginStore}/> 
                    {/each}
                    {#if validatorPlugins.length === 0}
                        <div class="mdc-typography--body2" style="margin-top: 1em;">
                            No plugins found.
                        </div>
                    {/if}
                </plugin-store-items>
            </plugin-store>
        </Content>
        <Actions>
            <plugin-store-action-buttons>
                <SMUIButton action="" disabled={isRestricted} onclick={() => openPluginDownloadUI()}>
                    <Label>Add External Plugin</Label>
                </SMUIButton>
                <SMUIButton action="accept">
                    <Label>Close</Label>
                </SMUIButton>
            </plugin-store-action-buttons>
        </Actions>
    </Dialog>
</Theme>

<style>
    :root,
    :host {
        --header-height: 128px;
        scrollbar-color: var(--color-grey-2) var(--mdc-theme-surface);
    }
    plugin-store {
        height: calc(100vh - var(--header-height));
        display: flex;
        flex-direction: column;
        align-items: stretch;
        position: relative;
    }
    plugin-store-header--top {
        display: flex;
        justify-content: space-between;
        width: 100%;
    }
    :global(.plugin-store-header) {
        flex-direction: column;
    }
    :global(.mdc-dialog.mdc-dialog-scroll-divider-header.mdc-dialog--fullscreen .mdc-dialog__header.plugin-store-header) {
        box-shadow: none;
    }
    plugin-store-toolbar {
        background: var(--mdc-theme-surface);
        display: flex;
        justify-content: space-between;
        place-items: center;
        margin-top: 0.8rem;
        width: 100%;
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
    plugin-store-items--category {
        margin-top: 2em; 
        margin-bottom: -0.35em;
        margin: 2em -1.5em -0.35em -1.5em;
        position: sticky;
        background: var(--mdc-theme-surface);
        top: 0;
        z-index: 10;
    }
    .plugin-store-items--category-title {
        margin: 0 1.2em;
    }
    .plugin-store-items--divider {
        display: flex;
        width: 100%;
        border: 0;
        height: 1px;
        background: black;
        opacity: 0.1;
        margin-bottom: 0;
    }
    plugin-store-action-buttons {
        display: flex;
        justify-content: space-between;
        width: 100%;
    }
</style>
