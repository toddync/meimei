<script lang="ts">
	//@ts-nocheck
	import EditorTab from "$lib/components/EditorTab.svelte";
	import TabHeader from "$lib/components/TabHeader.svelte";
	import * as Tabs from "$lib/components/ui/tabs";
	import { Active, TabsList } from "$lib/stores/tabStore.svelte";
</script>

<Tabs.Root bind:value={$Active} class="flex flex-col flex-1 w-full">
	<Tabs.List
		class="top-0 z-40 fixed flex justify-start gap-1 p-0 pr-24 pl-1 rounded-none w-full"
	>
		{#each TabsList as tab}
			<TabHeader file={tab} />
		{/each}
	</Tabs.List>
	{#each TabsList as tab}
		<EditorTab file={tab} />
	{/each}
</Tabs.Root>
