<script>
	//@ts-nocheck
	import { FolderClosed, FolderOpen } from "lucide-svelte";
	import { slide } from "svelte/transition";
	import { Button } from "../ui/button";
	import File from "./File.svelte";
	import Folder from "./Folder.svelte";

	let { expanded, baseName, contents = $bindable() } = $props();

	function toggle() {
		expanded = !expanded;
	}
</script>

<Button
	class="m-0 w-full! focus:outline-hidden justify-start truncate"
	variant="ghost"
	onclick={() => (expanded = !expanded)}
>
	{#if expanded}
		<FolderOpen class="size-4! my-auto text-zinc-400" />
	{:else}
		<FolderClosed class="size-4! my-auto text-zinc-400" />
	{/if}
	{baseName}
</Button>

{#if expanded}
	<ul
		transition:slide={{ duration: 300 }}
		class="pl-2 border-l-4 border-border"
	>
		{#each contents as file}
			<li class="py-1">
				{#if file.dir}
					<Folder {...file} />
				{:else}
					<File {...file} />
				{/if}
			</li>
		{/each}
	</ul>
{/if}
