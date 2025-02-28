<script>
	//@ts-nocheck
	import { invoke } from "@tauri-apps/api/core";
	import { goto } from "$app/navigation";
	import { Button } from "$lib/components/ui/button";
	import { Separator } from "$lib/components/ui/separator";
	import { ArrowLeft } from "lucide-svelte";
	import { Input } from "$lib/components/ui/input";
	import { open } from "@tauri-apps/plugin-dialog";

	let location = $state(false);
	async function browse() {
		const folder = await open({
			multiple: false,
			directory: true,
			canCreateDirectories: true,
			title: "meimei - choose a folder",
		});
		location = folder;
	}

	function create() {
		console.log(invoke("make_garden", { label: crypto.randomUUID() }));
	}
</script>

<main class="*:flex space-y-3 pt-16">
	<Button
		variant="ghost"
		class="mb-5 cursor-pointer"
		onclick={() => goto("/gardener")}
	>
		<ArrowLeft />Back
	</Button>
	<div>
		<span class="my-auto">
			<span>
				Create a new
				<span class="text-pink-400">Garden</span>
			</span>
		</span>
	</div>
	<Separator />
	<div>
		<span class="my-auto w-fit">
			<span> Garden name </span>
		</span>
		<Input class="my-auto ml-auto w-40" placeholder="Garden name" />
	</div>
	<Separator />
	<div>
		<div class="flex flex-col">
			<span class="my-auto w-fit">
				<span> Garden location </span>
			</span>
			{#if location}
				<div class="max-w-56 text-pink-400 text-sm">
					{location}
				</div>
			{/if}
		</div>
		<Button
			variant="outline"
			class="ml-auto cursor-pointer"
			onclick={browse}
		>
			Browse
		</Button>
	</div>

	<Button
		class="bg-pink-500 hover:bg-pink-400 mx-auto mt-5 text-primary transition-colors cursor-pointer"
		onclick={create}
	>
		Create
	</Button>
</main>
