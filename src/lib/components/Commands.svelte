<script lang="ts">
	//@ts-nocheck
	import * as Command from "$lib/components/ui/command";
	import { Files } from "$lib/stores/filesStore.svelte";
	import { Active, TabsList } from "$lib/stores/tabStore.svelte";

	let open = $state(false);
	function handleKeydown(e) {
		if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			open = !open;
			console.log(open);
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<Command.Dialog bind:open>
	<Command.Input placeholder="Type a command or search..." />
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>

		<!-- <Command.Separator /> -->
		<Command.Group heading="Files">
			{#each $Files.raw as file}
				<Command.Item
					onSelect={() => {
						if (!TabsList.find((e) => e.path == file.path)) {
							TabsList.push(file);
						}
						$Active = file.path;
						open = false;
					}}
				>
					<span class="truncate text-sm">
						{file.baseName}
					</span>
					<span class="text-muted-foreground text-xs truncate">
						{file.directory}
					</span>
				</Command.Item>
			{/each}
		</Command.Group>
	</Command.List>
</Command.Dialog>
