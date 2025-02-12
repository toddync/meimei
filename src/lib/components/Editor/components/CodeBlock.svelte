<script lang="ts">
	//@ts-nocheck
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import type { NodeViewProps } from "@tiptap/core";
	import { ClipboardList } from "lucide-svelte";
	import { onMount } from "svelte";
	import { NodeViewWrapper } from "svelte-tiptap";
	import LanguageSelect from "./LanguageSelect.svelte";
	import CodeJar from "./codeJar.svelte";

	let {
		node,
		updateAttributes,
		editor,
		getPos,
		deleteNode,
		selected,
	}: NodeViewProps = $props();

	onMount(() => {
		const unescapeHtmlAttribute = (str) =>
			str
				.replace(/&amp;/g, "&")
				.replace(/&quot;/g, '"')
				.replace(/&#39;/g, "'")
				.replace(/&lt;/g, "<")
				.replace(/&gt;/g, ">")
				.replace(/&#10;/g, "\n")
				.replace(/&#13;/g, "\r");

		let code = unescapeHtmlAttribute(node.attrs.code);
		if (node.attrs.code != code) {
			updateAttributes({ code });
		}
	});

	let timer = $state();
	function update(code) {
		clearTimeout(timer);
		timer = setTimeout(() => {
			updateAttributes({ code });
		}, 100);
	}
</script>

<NodeViewWrapper class="space-y-5 my-5">
	<Card.Root
		data-selected={selected || null}
		class="data-[selected]:border-pink-500 transition-colors min-h-20 p-0 rounded-2xl overflow-clip m-0"
		contenteditable="false"
	>
		<div class="flex gap-2 h-10 px-2 bg-accent">
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="border-[3px] border-[#FF605C] hover:bg-[#FF605C] transition-colors size-4 my-auto rounded-full cursor-pointer"
				onclick={() => deleteNode()}
			></div>
			<div
				class="border-[3px] border-[#FFBD44] size-4 my-auto rounded-full"
			></div>
			<div
				class="border-[3px] border-[#00CA4E] size-4 my-auto rounded-full"
			></div>
			<span class="flex-1 flex">
				<LanguageSelect
					val={node.attrs.language}
					update={(e) => {
						updateAttributes({ language: e });
					}}
				/>
			</span>
			<Button
				variant="ghost"
				size="icon"
				class="cursor-pointer hover:bg-accent transition-colors"
				onclick={() => navigator.clipboard.writeText(node.attrs.code)}
			>
				<ClipboardList class="stroke-muted-foreground" />
			</Button>
		</div>
		<Card.Content
			class="min-h-15 p-0"
			onclick={() => editor.commands.setNodeSelection(getPos())}
		>
			<CodeJar
				bind:code={node.attrs.code}
				bind:lang={node.attrs.language}
				{selected}
				{update}
			/>
		</Card.Content>
	</Card.Root>
</NodeViewWrapper>
