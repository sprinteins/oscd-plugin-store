<script lang="ts">
    import Button, { Group, Label } from "@smui/button";

    interface Props {
        variant?: "text" | "raised" | "unelevated" | "outlined";
        children?: import("svelte").Snippet;
        onclick?: () => void;
    }

    let { variant = "raised", children, onclick }: Props = $props();
</script>

<Group {variant}>
    <Button {onclick} {variant} style="min-width: 148px;">
        <Label>{@render children?.()}</Label>
    </Button>
</Group>
