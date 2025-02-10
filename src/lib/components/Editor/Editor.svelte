<script lang="ts">
	//@ts-nocheck
	import * as Card from "$lib/components/ui/card";
	import { Editor } from "@tiptap/core";
	import CharacterCount from "@tiptap/extension-character-count";
	import { Color } from "@tiptap/extension-color";
	import ListItem from "@tiptap/extension-list-item";
	import TextAlign from "@tiptap/extension-text-align";
	import TextStyle from "@tiptap/extension-text-style";
	import StarterKit from "@tiptap/starter-kit";
	import { onMount, untrack } from "svelte";
	import { createEditor, EditorContent } from "svelte-tiptap";
	import type { Readable } from "svelte/store";
	import { Markdown } from "tiptap-markdown";
	import BubbleMenu from "./BubbleMenu.svelte";
	import { CodeBlockExt } from "./ext/codeBlock";
	import { CounterExt } from "./ext/counter";
	import Gapcursor from "@tiptap/extension-gapcursor";

	let editor = $state() as Readable<Editor>;
	let { content = $bindable(""), change = () => {} } = $props();

	let count = $state({
		words: 0,
		chars: 0,
	});

	$effect(() => {
		content;
		untrack(() => {
			const escapeHtmlAttribute = (str) =>
				str
					.replace(/&/g, "&amp;")
					.replace(/"/g, "&quot;")
					.replace(/'/g, "&#39;")
					.replace(/</g, "&lt;")
					.replace(/>/g, "&gt;")
					.replace(/\n/g, "&#10;") // Preserve newlines
					.replace(/\r/g, "&#13;"); // Preserve carriage returns

			const converted = content.replace(
				/```(\w+)\n([\s\S]*?)\n```(?!.)/g,
				(match, lang, code) => {
					const safeCode = escapeHtmlAttribute(code.trim());
					return `<code-block language="${lang}" code="${safeCode}"></code-block>`;
				}
			);

			console.clear();
			$editor?.commands?.insertContentAt(0, converted);
			setTimeout(() => $editor?.commands?.focus(0), 200);
			(async () => {
				count = {
					words: $editor?.storage.characterCount.words(),
					chars: $editor?.storage.characterCount.characters(),
				};
			})();
		});
	});

	onMount(() => {
		editor = createEditor({
			extensions: [
				CodeBlockExt,
				CounterExt,

				Gapcursor,
				CharacterCount,
				Color.configure({ types: [TextStyle.name, ListItem.name] }),
				TextStyle.configure({ types: [ListItem.name] }),
				Markdown.configure({
					html: true,
					tightLists: true, // No <p> inside <li> in markdown output
					tightListClass: "tight",
					bulletListMarker: "-",
					linkify: true,
					breaks: false,
					transformPastedText: true,
					transformCopiedText: false, // Copied text is transformed to markdown
				}),

				TextAlign.configure({
					defaultAlignment: "left",
					types: ["heading", "paragraph"],
					alignments: ["left", "center", "right", "justify"],
				}),
				StarterKit.configure({
					bulletList: {
						keepMarks: true,
					},
					orderedList: {
						keepMarks: true,
					},
					heading: {
						levels: [1, 2, 3],
					},
					codeBlock: false,
					code: false,
				}),
			],
			editorProps: {
				attributes: {
					class: "editorEl p-2 relative",
				},
			},
			content: content,
			onUpdate() {
				change?.(editor);
				(async () => {
					count = {
						words: $editor?.storage.characterCount.words(),
						chars: $editor?.storage.characterCount.characters(),
					};
				})();
			},
			onSelectionUpdate() {
				const { selection } = $editor.state;

				const viewportCoords = $editor.view.coordsAtPos(selection.from);
				const absoluteOffset = window.scrollY + viewportCoords.top;

				window.scrollTo(
					window.scrollX,
					absoluteOffset - window.innerHeight / 2
				);
			},
		});

		$editor.chain().focus();
	});
</script>

<div class="pb-5 max-w-[95%]! mx-auto h-full select-none">
	<BubbleMenu editor={$editor} />

	<EditorContent editor={$editor} class="editor" />
</div>

{#if editor}
	<Card.Root class="fixed bottom-2 right-2 select-none hidden">
		<Card.Content class="p-2">
			{count.words} words, {count.chars} characters
		</Card.Content>
	</Card.Root>
{/if}

<!--
	BubbleMenuExt.configure({
		tippyOptions: {
			// placement: "right-end",
			hideOnClick: false,
			animateFill: true,
			interactive: true,
			duration: 100,
			zIndex: 10,
		},
		shouldShow: ({ from, to }) => {
			return from != to;
		},
	}),
-->
