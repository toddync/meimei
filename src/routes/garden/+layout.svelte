<script lang="ts">
	//@ts-nocheck
	import Commands from "$lib/components/Commands.svelte";
	import Sidebar_ from "$lib/components/Sidebar.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar";
	import { W } from "$lib/stores/WindowStore";
	import { Files as FILES, loadFiles } from "$lib/stores/filesStore.svelte";
	import { flowerLotus } from "@lucide/lab";
	import { LogicalSize } from "@tauri-apps/api/dpi";
	import { Circle, Files, Icon } from "lucide-svelte";
	import { onMount } from "svelte";

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

	onMount(async () => {
		await $W?.setSize(new LogicalSize(800, 600));
		setTimeout(() => $W?.center(), 10);
	});
</script>

<div
	class="group right-0 z-50 fixed flex *:mx-auto px-3 w-24 h-10 pointer-events-auto"
>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span onclick={() => $W?.close()} class="my-auto">
		<Circle
			class="group-hover:bg-[#FF605C] stroke-[#FF605C] stroke-[0.3] rounded-full size-4 transition-colors cursor-pointer"
		/>
	</span>

	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span onclick={() => $W?.toggleMaximize()} class="my-auto">
		<Circle
			class="group-hover:bg-[#FFBD44] stroke-[#FFBD44] stroke-[0.3] my-auto rounded-full size-4 transition-colors delay-100 cursor-pointer"
		/>
	</span>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span onclick={() => $W?.minimize()} class="my-auto">
		<Circle
			class="group-hover:bg-[#00CA4E] stroke-[#00CA4E] stroke-[0.3] rounded-full size-4 transition-colors delay-200 cursor-pointer"
		/>
	</span>
</div>

<main class="grid grid-cols-[3rem_1fr] select-none">
	<div
		class="top-0 z-50 sticky gap-3 grid auto-rows-max bg-background p-1 border-r h-svh select-none *:select-none"
	>
		<div class="flex -mt-1 -ml-1 bg-border w-[3rem] h-10">
			<Icon
				iconNode={flowerLotus}
				class="!stroke-[0.5] mx-auto my-auto size-8 text-pink-500"
			/>
		</div>

		<Button variant="ghost" size="icon" onclick={() => toggle()}>
			<Files class="!stroke-2 !size-6 text-zinc-500" />
		</Button>
	</div>

	<Sidebar.Provider bind:open class="bg-accent">
		<Sidebar_ />
		<main class="flex flex-1 bg-background w-full overflow-x-hidden">
			{@render children?.()}
			<Commands />
		</main>
	</Sidebar.Provider>
</main>
