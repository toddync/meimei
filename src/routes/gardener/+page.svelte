<script lang="ts">
	//@ts-nocheck
	import { goto } from "$app/navigation";
	import { Button } from "$lib/components/ui/button";
	import { Separator } from "$lib/components/ui/separator";
	import { encodeFilePath } from "$lib/stores/filesStore.svelte";
	import { W } from "$lib/stores/WindowStore";
	import { invoke } from "@tauri-apps/api/core";
	import { getAllWindows } from "@tauri-apps/api/window";
	import { open } from "@tauri-apps/plugin-dialog";
	import { exists, mkdir } from "@tauri-apps/plugin-fs";

	async function Open() {
		const folder = await open({
			multiple: false,
			directory: true,
			canCreateDirectories: true,
			title: "meimei - choose a folder",
		});
		if (!folder) return;

		if (!(await exists(`${folder}/.meimei`)))
			await mkdir(`${folder}/.meimei`);

		let gardens = [];
		if (localStorage.getItem("gardenList"))
			gardens = JSON.parse(localStorage.getItem("gardenList"));

		if (!gardens.find((g) => g == folder)) {
			gardens.push(folder);
			localStorage.setItem("gardenList", JSON.stringify(gardens));
		}

		let Ws = await getAllWindows();
		let label = encodeFilePath(folder);
		let index = Ws.findIndex((W) => W.label == label);

		if (index >= 0) await Ws[index].setFocus();
		else await invoke("open_window", { label });

		await $W?.close();
	}
</script>

<main class="*:flex space-y-3 pt-16">
	<div>
		<span class="my-auto pointer-events-none select-none">
			<span>
				Create a new
				<span class="text-pink-400">Garden</span>
				<span class="block text-muted-foreground text-sm">
					Create a new garden folder
				</span>
			</span>
		</span>
		<Button
			class="bg-pink-500 hover:bg-pink-400 ml-auto text-primary transition-colors cursor-pointer"
			onclick={() => goto("/gardener/new")}
		>
			Create
		</Button>
	</div>
	<Separator />
	<div>
		<span class="my-auto">
			<span>
				Turn a folder into a garden
				<span class="block text-muted-foreground text-sm">
					Use an existing folder
				</span>
			</span>
		</span>
		<Button class="ml-auto cursor-pointer" variant="outline" onclick={Open}
			>Open</Button
		>
	</div>
	<Separator />
</main>
