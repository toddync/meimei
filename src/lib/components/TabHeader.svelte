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
			name: "",
		}),
	} = $props();
</script>

<div>
	<Tabs.Trigger
		value={file.path}
		class="flex gap-2 min-w-fit text-lg rounded-t-xl rounded-b-none bg-zinc-900 transition-colors select-none"
	>
		{file.name}
		<Button
			variant="ghost"
			class="p-1! h-min group hover:bg-red-900/10"
			onclick={() => {
				let index = TabsList.findIndex((e) => e.path == file.path);
				TabsList.splice(index, 1);

				if (TabsList.length > 0) {
					$Active = TabsList.at(-1).path;
					console.log($Active);
				}
			}}
		>
			<X class="group-hover:text-red-900 transition-colors" />
		</Button>
	</Tabs.Trigger>
</div>
