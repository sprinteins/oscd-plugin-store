<svelte:options customElement={{
    shadow:"open",
    extend: (customElementConstructor) => {
        return class extends customElementConstructor {
            constructor() {
                super();
                const cssCode = (globalThis as any).pluginStyle?.[pkg.name];
                if (this.shadowRoot && cssCode) {
                    this.shadowRoot.appendChild(cssCode);
                }
            }
        }
    }
}} />

<script lang="ts">
    import PluginStore from "./plugin-store.svelte";
    import { name, version } from "../package.json";
    import * as pkg from '../package.json'

    let isOpen = $state(false);

    export async function run() {
        isOpen = true;
    }
</script>

<PluginStore bind:isOpen />

<input type="hidden" name="package-name" value={name} />
<input type="hidden" name="package-version" value={version} />
