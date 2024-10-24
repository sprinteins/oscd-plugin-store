<script lang="ts">
import Button, { Group, Label } from "@smui/button";
import { createEventDispatcher } from "svelte";

const dispatch = createEventDispatcher();

export let variant: "text" | "raised" | "unelevated" | "outlined" = "raised";
</script>

<Group variant={variant}>
    <Button
        on:click={() => dispatch("click")}
        variant={variant}
        style="min-width: 148px;"
    >
        <Label><slot/></Label>
    </Button>
</Group>