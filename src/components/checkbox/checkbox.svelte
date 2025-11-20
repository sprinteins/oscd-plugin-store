<script lang="ts">
interface Props {
	checked?: boolean
	label: string
	value?: string | number
	testid?: string
	onchange?: () => void
	oninput?: () => void
}

let {
	checked = $bindable(false),
	label,
	value = $bindable(''),
	testid = '',
	onchange,
	oninput
}: Props = $props()
</script>

<checkbox data-testid={testid}>
    <label>
        <input type="checkbox" bind:value {onchange} {oninput} bind:checked />
        <span class="checkbox">{label}</span>
    </label>
</checkbox>

<style>
    .checkbox {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        accent-color: var(--color-accent);
    }
</style>
