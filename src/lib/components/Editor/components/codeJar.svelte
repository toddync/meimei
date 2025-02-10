<script lang="ts">
	//@ts-nocheck
	import { highlighter } from "$lib/shiki";
	import { onMount, untrack } from "svelte";

	let editorEl = $state();
	let {
		selected = $bindable(),
		lang = $bindable(),
		code = $bindable(),
		update = () => {},
	} = $props();

	const highlight = (editor: HTMLElement) => {
		let code_ = editor.textContent;
		if (code_) {
			code = code_;
			editor.innerHTML = $highlighter.codeToHtml(code, {
				lang,
				theme: "github-dark-default",
			});
		}
	};

	onMount(async () => {
		const { CodeJar } = await import("codejar");
		let jar = CodeJar(editorEl, highlight, {
			tab: "    ",
		});
		editorEl.textContent = code;
		highlight(editorEl);
	});

	$effect(() => {
		lang;
		code;
		untrack(() => {
			highlight(editorEl);
		});
	});
</script>

<div
	class="flex-1 *:!rounded-none *:!bg-transparent *:!m-0"
	bind:this={editorEl}
></div>
