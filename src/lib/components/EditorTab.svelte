<script lang="ts">
	//@ts-nocheck
	import Editor from "$lib/components/Editor/index.svelte";
	import * as Tabs from "$lib/components/ui/tabs";
	import Textarea from "$lib/components/ui/textarea/textarea.svelte";
	import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
	import { Editor as Editor_ } from "@tiptap/core";
	import { onMount, setContext } from "svelte";
	import type { Readable } from "svelte/store";

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
		if (file.extension == "txt" || file.extension == "md") {
			title.dataset.clonedVal = file.baseName;
			content = await readTextFile(file.path);
		}
	});

	async function save(text) {
		await writeTextFile(file.path, text);
	}
</script>

<div>
	<Tabs.Content
		value={file.path}
		class="mx-auto mt-24 w-full max-w-[900px] select-none"
	>
		<div
			bind:this={title}
			class="grid flex-1 px-4 text-4xl font-extrabold after:overflow-hidden after:py-2.5 [&>textarea]:text-inherit after:text-inherit [&>textarea]:resize-none [&>textarea]:overflow-y-scroll [&>textarea]:[grid-area:1/1/2/2] after:[grid-area:1/1/2/2] after:whitespace-pre-wrap after:break-words after:invisible after:content-[attr(data-cloned-val)_'_'] after:border after:max-h-[200px] after:p-2"
		>
			<Textarea
				rows={1}
				class="focus-visible:ring-opacity-0 p-2 focus-visible:border-foreground/60 border-none rounded-l-xl min-h-0! font-extrabold text-4xl! break-words resize-none"
				bind:value={file.baseName}
				onchange={(e) =>
					(e.target.parentNode.dataset.clonedVal = e.target.value)}
				oninput={(e) =>
					(e.target.parentNode.dataset.clonedVal = e.target.value)}
			/>
		</div>

		<Editor
			bind:content
			change={(editor) => {
				save(editor.storage.markdown.getMarkdown());
			}}
		/>
	</Tabs.Content>
</div>
