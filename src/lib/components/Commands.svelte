<script lang="ts">
	//@ts-nocheck
	import * as Command from "$lib/components/ui/command";
	import { Files, Root } from "$lib/stores/filesStore.svelte";
	import { Active, TabsList } from "$lib/stores/tabStore.svelte";

	let open = $state(false);
	function handleKeydown(e) {
		if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			open = !open;
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
				{#if file.file}
					<Command.Item
						onSelect={() => {
							open = false;
							setTimeout(() => {
								if (!TabsList.find((e) => e.path == file.path))
									TabsList.push(file);
								$Active = file.path;
							}, 0);
						}}
					>
						<span class="truncate max-w-1/2 text-sm">
							{file.baseName}
						</span>
						<span class="text-muted-foreground text-xs truncate">
							{file.directory.replace($Root, "")}
						</span>
					</Command.Item>
				{/if}
			{/each}
		</Command.Group>
	</Command.List>
</Command.Dialog>
