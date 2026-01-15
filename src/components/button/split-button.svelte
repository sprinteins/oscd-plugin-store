<script lang="ts">
import Button, { Group, GroupItem, Label } from '@smui/button'
import IconArrowDropDown from '../icons/icon-arrow-drop-down.svelte'

interface Props {
	variant?: 'text' | 'raised' | 'unelevated' | 'outlined'
	label?: string
	children?: import('svelte').Snippet
	onclick?: () => void
	onmenuOpen?: () => void
}

let {
	variant = 'raised',
	label = '',
	children,
	onclick,
	onmenuOpen
}: Props = $props()
</script>

<Group variant={variant}>
    <Button
        onclick={onclick}
        variant={variant}
        style="min-width: 102px;"
    >
        <Label>{label}</Label>
    </Button>
    <div use:GroupItem>
        <Button
            onclick={onmenuOpen}
            style="min-width: 18px;"
            variant={variant}
        >
            <IconArrowDropDown />
        </Button>
        {@render children?.()} 
    </div>
</Group>