<script lang="ts">
	//@ts-nocheck
	import Folder from "$lib/components/luxe/Folder.svelte";
	import { Files } from "$lib/stores/filesStore.svelte";
	import { slide } from "svelte/transition";
	import File from "./luxe/File.svelte";

	let root = $state([]);
</script>

<div class="z-50 p-1 pl-3 rounded-xl select-none">
	<ul transition:slide={{ duration: 300 }} class="gap-40">
		{#each $Files.tree as entry}
			<li class="py-1">
				{#if entry.dir}
					<Folder {...entry} />
				{:else}
					<File {...entry} />
				{/if}
			</li>
		{/each}
	</ul>
</div>
