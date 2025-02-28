<script>
	import { Button } from "$lib/components/ui/button";
	import * as Sidebar from "$lib/components/ui/sidebar";
	import { encodeFilePath } from "$lib/stores/filesStore.svelte";
	import { W } from "$lib/stores/WindowStore";
	import { flowerLotus } from "@lucide/lab";
	import { invoke } from "@tauri-apps/api/core";
	import { LogicalSize } from "@tauri-apps/api/dpi";
	import { Circle, Icon, Menu } from "lucide-svelte";

	let { children } = $props();
	let { toggle } = Sidebar.useSidebar();
	let gardens = $state(
		(() => JSON.parse(localStorage.getItem("gardenList") || "[]"))()
	);

	$effect(() => {
		(async () => {
			$W?.setTitle("Meimei - Gardener");
			await $W?.setSize(new LogicalSize(350, 540));
			setTimeout(async () => {
				await $W?.center();
			}, 10);
		})();
	});
</script>

<div
	class="group z-50 absolute flex bg-accent *:mx-auto px-3 rounded-br-xl w-24 h-10 pointer-events-auto"
>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span onclick={() => $W?.close()} class="my-auto">
		<Circle
			class="group-hover:bg-[#FF605C] stroke-[#FF605C] stroke-[0.3] rounded-full size-4 transition-colors cursor-pointer"
		/>
	</span>

	<Circle
		class="group-hover:bg-[#FFBD44] stroke-[#FFBD44] stroke-[0.3] my-auto rounded-full size-4 transition-colors delay-100 cursor-not-allowed"
	/>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span onclick={() => $W?.minimize()} class="my-auto">
		<Circle
			class="group-hover:bg-[#00CA4E] stroke-[#00CA4E] stroke-[0.3] rounded-full size-4 transition-colors delay-200 cursor-pointer"
		/>
	</span>
</div>

<Button
	variant="outline"
	size="icon"
	class="top-2 right-1.5 z-10 absolute border"
	onclick={toggle}
>
	<Menu />
</Button>

<main class="relative flex flex-col flex-1 p-10">
	<div class="flex flex-col gap-1 mx-auto pointer-events-none select-none">
		<Icon
			iconNode={flowerLotus}
			class="*:stroke-[0.5] mx-auto size-32 text-pink-500"
		/>

		<span class="mx-auto font-bold text-pink-300 text-3xl capitalize">
			meimei
		</span>

		<span class="mx-auto text-muted-foreground text-sm">v 0.2.0 </span>
	</div>

	{@render children?.()}
</main>

<Sidebar.Root side="right">
	<Sidebar.Header />
	<Sidebar.Content>
		<Sidebar.Content>
			<Sidebar.Menu>
				{#each gardens as garden}
					<Button
						variant="ghost"
						class="flex-col flex-1 items-start mx-2 py-3"
						onclick={async () => {
							await invoke("open_window", {
								label: encodeFilePath(garden),
							});
							await $W?.close();
						}}
					>
						{garden.split("/").at(-1)}

						<span class="text-muted-foreground text-xs">
							{garden}
						</span>
					</Button>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Content>
	</Sidebar.Content>
	<Sidebar.Footer />
</Sidebar.Root>
