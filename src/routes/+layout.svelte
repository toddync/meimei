<script lang="ts">
	//@ts-nocheck
	import Sidebar_ from "$lib/components/Sidebar.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar";
	import { highlighter } from "$lib/shiki";
	import { flowerLotus } from "@lucide/lab";
	import { Files, Icon } from "lucide-svelte";
	import { bundledLanguages, createHighlighter } from "shiki/bundle/web";
	import "../app.css";

	(async () => {
		$highlighter = await createHighlighter({
			themes: ["github-dark-default"],
			langs: Object.keys(bundledLanguages),
		});
	})();

	let open = $state(
		(() => {
			if (localStorage.getItem("sidebar:open")) {
				return localStorage.getItem("sidebar:open") == "true";
			} else {
				localStorage.setItem("sidebar:open", "true");
				return true;
			}
		})()
	);
	const toggle = () => (open = !open);

	$effect(() => {
		localStorage.setItem("sidebar:open", JSON.stringify(open));
	});

	let { children } = $props();
</script>

<main class="grid grid-cols-[3rem_1fr] select-none">
	<div
		class="sticky top-0 z-50 grid gap-3 p-1 border-r auto-rows-max h-svh bg-background select-none *:select-none"
	>
		<div class="h-10 bg-border w-[3rem] -ml-1 -mt-1 flex">
			<Icon
				iconNode={flowerLotus}
				class="text-pink-500 size-8 mx-auto my-auto !stroke-2"
			/>
		</div>

		<Button variant="ghost" size="icon" onclick={() => toggle()}>
			<Files class="!size-6 text-zinc-500 !stroke-2" />
		</Button>
	</div>

	<Sidebar.Provider bind:open class="bg-accent">
		<Sidebar_ />
		<main class="flex flex-1 overflow-x-hidden bg-background">
			{@render children?.()}
		</main>
	</Sidebar.Provider>
</main>
