<script lang="ts">
	//@ts-nocheck
	import Editor from "$lib/components/Editor/index.svelte";
	import * as Tabs from "$lib/components/ui/tabs";
	import Textarea from "$lib/components/ui/textarea/textarea.svelte";
	import { readTextFile } from "@tauri-apps/plugin-fs";
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";

	let {
		file = $bindable({
			path: "",
			name: "",
			ext: "",
		}),
	} = $props();
	let title = $state();
	let content = $state("");

	onMount(async () => {
		if (file.ext == "txt" || file.ext == "md") {
			title.dataset.clonedVal = file.name;
			content = await readTextFile(file.path);
		}
	});
</script>

<div>
	<Tabs.Content
		value={file.path}
		class="select-none mt-12 mx-auto max-w-[900px] w-full"
	>
		<div
			bind:this={title}
			class="grid flex-1 px-4 text-4xl font-extrabold after:overflow-hidden after:py-2.5 [&>textarea]:text-inherit after:text-inherit [&>textarea]:resize-none [&>textarea]:overflow-y-scroll [&>textarea]:[grid-area:1/1/2/2] after:[grid-area:1/1/2/2] after:whitespace-pre-wrap after:break-words after:invisible after:content-[attr(data-cloned-val)_'_'] after:border after:max-h-[200px] after:p-2"
		>
			<Textarea
				rows={1}
				class="p-2 text-4xl! font-extrabold break-words resize-none focus-visible:border-foreground/60 focus-visible:ring-opacity-0 min-h-0! rounded-l-xl border-none"
				bind:value={file.name}
				onchange={(e) =>
					(e.target.parentNode.dataset.clonedVal = e.target.value)}
				oninput={(e) =>
					(e.target.parentNode.dataset.clonedVal = e.target.value)}
			/>
		</div>

		<Editor bind:content />
	</Tabs.Content>
</div>
