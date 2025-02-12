<script lang="ts">
	//@ts-nocheck
	import { Active, TabsList } from "$lib/stores/tabStore.svelte";
	import { FileText, PenTool } from "lucide-svelte";
	import { Button } from "../ui/button";

	let { path, extension, baseName } = $props();
</script>

<Button
	data-selected={$Active == path || null}
	class="m-0 w-full overflow-ellipsis truncate focus:outline-hidden justify-start data-[selected]:bg-accent"
	variant="ghost"
	onclick={() => {
		if (!TabsList.find((e) => e.path == path)) {
			TabsList.push({
				path,
				baseName,
				extension,
			});
		}
		$Active = path;
	}}
>
	<FileText
		data-selected={$Active == path || null}
		class="size-4! my-auto stroke-zinc-400 data-[selected]:stroke-pink-500"
	/>
	{baseName}
</Button>
