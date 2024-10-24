<script lang="ts">
import Button, { Group, GroupItem, Label } from "@smui/button";
import IconArrowDropDown from "../icons/icon-arrow-drop-down.svelte";
import { createEventDispatcher } from "svelte";

const dispatch = createEventDispatcher();

export let variant: "text" | "raised" | "unelevated" | "outlined" = "raised";
export let label = "";
</script>

<Group variant={variant}>
    <Button
        on:click={() => dispatch("click")}
        variant={variant}
        style="min-width: 102px;"
    >
        <Label>{label}</Label>
    </Button>
    <div use:GroupItem>
        <Button
            on:click={() => dispatch("menuOpen")}
            style="min-width: 18px;"
            variant={variant}
        >
            <IconArrowDropDown />
        </Button>
        <slot/> 
    </div>
</Group>