<script lang="ts">
	//@ts-nocheck
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import Loader from "$lib/components/Loader.svelte";
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { highlighter } from "$lib/shiki";
	import {
		decodeFilePath,
		Files,
		loadFiles,
		Root,
	} from "$lib/stores/filesStore.svelte";
	import { W } from "$lib/stores/WindowStore";
	import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
	import { bundledLanguages, createHighlighter } from "shiki/bundle/web";
	import "../app.css";

	let { children } = $props();
	let loading = $state(true);
	let route = $derived(page.url.pathname);

	(async () => {
		{
			$W = await getCurrentWindow();
			await $W?.setSize(new LogicalSize(250, 250));
			setTimeout(() => $W?.center(), 10);

			/* $W?.listen("open", (e) => {
				let data = e.payload;
				if (data.from == $W?.label) return;
			}); */
		}

		$highlighter = await createHighlighter({
			langs: Object.keys(bundledLanguages),
			themes: ["github-dark-default"],
		});

		//* provisory
		if ($W.label == "main" || $W.label == "gardener") {
			loading = false;
			goto("/gardener");
		} else {
			$Root = decodeFilePath($W.label);
			$Files = await loadFiles($Root);
			loading = false;
			goto("/garden");
		}
	})();
</script>

{#if loading}
	<main class="p-5 w-svw h-svh">
		<Loader />
	</main>
{:else if page.status == 404}
	<main class="flex h-svh">
		<Card.Root class="mx-auto my-auto w-fit">
			<Card.Header class="space-y-3">
				<Card.Title>How did you get here?</Card.Title>
				<Card.Description>Seriously, how?</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>Get to a page that exists!</p>
			</Card.Content>
			<Card.Footer>
				<Button
					variant="outline"
					class="mx-auto font-bold"
					onclick={() => goto("/gardener")}
				>
					Enter a <span class="text-pink-400 capitalize">garden</span>
				</Button>
			</Card.Footer>
		</Card.Root>
	</main>
{:else if route.includes("/gardener")}
	<Sidebar.Provider>
		{@render children?.()}
	</Sidebar.Provider>
{:else}
	{@render children?.()}
{/if}
