<script>
	//@ts-nocheck
	import { Button } from "$lib/components/ui/button";
	import * as Command from "$lib/components/ui/command";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import langs from "../ext/langs.svelte";

	let { val, update } = $props();
	let open = $state(false);

	let name = $derived.by(() => langs.find((l) => l.tag == val).name);
	let icon = $derived.by(() => langs.find((l) => l.tag == val).icon || null);
</script>

<svelte:head>
	<link
		rel="stylesheet"
		type="text/css"
		href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
	/>
</svelte:head>
<svelte:document onkeypress={(e) => e.keyCode == "Escape" && (open = false)} />

<DropdownMenu.Root bind:open>
	<DropdownMenu.Trigger class="mx-auto gap-2 w-fit">
		<Button
			variant="ghost"
			class="mx-auto text-muted-foreground w-40 focus:outline-0 cursor-pointer"
		>
			{#if icon}
				<span class="size-4 my-auto">
					<!-- svelte-ignore svelte_component_deprecated -->
					<svelte:component this={icon} />
				</span>
			{:else}
				<i class="devicon-{val}-plain"></i>
			{/if}

			<span class="mx-auto">
				{name}
			</span>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<Command.Root>
				<Command.Input placeholder="{val}..." />
				<Command.List class="mt-2 max-h-60">
					<Command.Empty>No results found.</Command.Empty>

					{#each langs as lang}
						<Command.Item
							onSelect={() => {
								open = false;
								update(lang.tag);
							}}
							onclick={() => {
								open = false;
								update(lang.tag);
							}}
						>
							{#if lang.icon}
								<!-- svelte-ignore svelte_component_deprecated -->
								<svelte:component this={lang.icon} />
							{:else}
								<i class="devicon-{lang.tag}-plain"></i>
							{/if}
							{lang.name}
						</Command.Item>
					{/each}
				</Command.List>
			</Command.Root>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
