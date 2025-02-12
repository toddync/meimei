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
</script>

<Tabs.Trigger
	value={file.path}
	class="flex gap-2 w-fit max-w-60 text-lg rounded-t-xl rounded-b-none bg-zinc-900 transition-colors select-none"
>
	<span class="truncate">
		{file.baseName}
	</span>
	<Button
		variant="ghost"
		class="p-1! h-min group hover:bg-red-900/10"
		onclick={() => {
			let index = TabsList.findIndex((e) => e.path == file.path);
			TabsList.splice(index, 1);

			if (TabsList.length > 0) {
				setTimeout(() => ($Active = TabsList.at(-1).path), 50);
			}
		}}
	>
		<X class="group-hover:text-red-900 transition-colors" />
	</Button>
</Tabs.Trigger>
