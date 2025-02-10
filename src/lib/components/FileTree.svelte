<script lang="ts">
	//@ts-nocheck
	import Folder from "$lib/components/luxe/Folder.svelte";
	import { readDir } from "@tauri-apps/plugin-fs";
	import { onMount } from "svelte";
	import File from "./luxe/File.svelte";

	let base = "/home/danny/vaults/D&D/";
	let root = $state([]);

	onMount(async () => {
		let fileRoot = await readDir(base);

		fileRoot = fileRoot.filter((entry) => entry.name[0] != ".");
		fileRoot.sort((a, b) => {
			if (a.isDirectory && b.isFile) return false;
			return true;
		});

		async function expand(entry, base) {
			if (entry.isDirectory) {
				let fileRoot = await readDir(`${base}/${entry.name}`);

				fileRoot = fileRoot.filter((entry) => entry.name[0] != ".");
				fileRoot.sort((a, b) => {
					if (a.isDirectory && b.isFile) return false;
					return true;
				});

				let files = [];

				for (let i = 0; i < fileRoot.length; i++) {
					files.push(
						await expand(fileRoot[i], `${base}/${entry.name}`)
					);
				}

				return {
					type: "folder",
					name: entry.name,
					files,
					path: `${base}/${entry.name}`,
					expanded: false,
				};
			} else {
				return {
					type: "file",
					name: entry.name,
					path: `${base}/${entry.name}`,
					ext: entry.name.split(".").at(-1),
				};
			}
		}

		for (let i = 0; i < fileRoot.length; i++) {
			root.push(await expand(fileRoot[i], base));
		}
	});
</script>

<div class="z-50 p-1 pl-3 rounded-xl select-none">
	<ul transition:slide={{ duration: 300 }} class="gap-40">
		{#each root as entry}
			<li class="py-1">
				{#if entry.type === "folder"}
					<Folder {...entry} />
				{:else}
					<File {...entry} />
				{/if}
			</li>
		{/each}
	</ul>
</div>
