<script lang="ts">
	//@ts-nocheck
	import EditorTab from "$lib/components/EditorTab.svelte";
	import TabHeader from "$lib/components/TabHeader.svelte";
	import * as Tabs from "$lib/components/ui/tabs";
	import { Active, TabsList } from "$lib/stores/tabStore.svelte";
</script>

<Tabs.Root bind:value={$Active} class="flex-1 flex flex-col">
	<Tabs.List
		class="fixed top-0 rounded-none w-full justify-start p-0 pl-1 flex gap-1 z-50"
	>
		{#each TabsList as tab}
			<TabHeader file={tab} />
		{/each}
	</Tabs.List>
	{#each TabsList as tab}
		<EditorTab file={tab} />
	{/each}
</Tabs.Root>
