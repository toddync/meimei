<script>
	//@ts-nocheck
	import { FolderClosed, FolderOpen } from "lucide-svelte";
	import { slide } from "svelte/transition";
	import File from "./File.svelte";
	import Folder from "./Folder.svelte";
	import { Button } from "../ui/button";

	let { expanded, name, files = $bindable() } = $props();

	function toggle() {
		expanded = !expanded;
	}
</script>

<Button
	class="p-0 m-0 w-full! min-w-fit focus:outline-hidden justify-start"
	variant="ghost"
	onclick={() => (expanded = !expanded)}
>
	{#if expanded}
		<FolderOpen class="size-4! my-auto text-zinc-400" />
	{:else}
		<FolderClosed class="size-4! my-auto text-zinc-400" />
	{/if}
	{name}
</Button>

{#if expanded}
	<ul
		transition:slide={{ duration: 300 }}
		class="pl-2 border-l-2 border-border"
	>
		{#each files as file}
			<li class="py-1">
				{#if file.type === "folder"}
					<Folder {...file} />
				{:else}
					<File {...file} />
				{/if}
			</li>
		{/each}
	</ul>
{/if}
