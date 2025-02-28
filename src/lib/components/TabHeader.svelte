<script lang="ts">
	//@ts-nocheck
	import * as Tabs from "$lib/components/ui/tabs";
	import { Active, TabsList } from "$lib/stores/tabStore.svelte";
	import { X } from "lucide-svelte";
	import { fade } from "svelte/transition";
	import { Button } from "./ui/button";

	let {
		file = $bindable({
			path: "",
			baseName: "",
		}),
	} = $props();
	function close() {
		let index = TabsList.findIndex((e) => e.path == file.path);
		TabsList.splice(index, 1);

		if (TabsList.length > 0) {
			setTimeout(() => ($Active = TabsList.at(-1).path), 50);
		} else {
			setTimeout(() => ($Active = ""), 50);
		}
	}
</script>

<svelte:document
	onkeypress={(e) => {
		if ($Active == file.path) {
			if (e.key === "w" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				close();
			}
		}
	}}
/>

<Tabs.Trigger
	value={file.path}
	class="flex gap-2 bg-zinc-900 rounded-t-xl rounded-b-none w-fit max-w-60 h-full text-lg transition-colors cursor-pointer select-none"
>
	<span class="text-muted-foreground text-sm truncate">
		{file.baseName}
	</span>
	<Button
		variant="ghost"
		class="group p-1! h-min cursor-pointer"
		onclick={close}
	>
		<X class="group-hover:text-red-900 !size-3 transition-colors" />
	</Button>
</Tabs.Trigger>
