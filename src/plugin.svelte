<script lang="ts">
import { name, version } from '../package.json'
import PluginStore from './plugin-store.svelte'

let isOpen = $state(false)

export async function run() {
	isOpen = true
}
</script>

<PluginStore bind:isOpen />

<input type="hidden" name="package-name" value={name} />
<input type="hidden" name="package-version" value={version} />
