<script lang="ts">
	//@ts-nocheck
	import { FileText } from "lucide-svelte";
	import { Button } from "../ui/button";
	import { Active, TabsList } from "$lib/stores/tabStore.svelte";

	let { path, ext, name } = $props();
</script>

<Button
	class="p-0 m-0 w-full! min-w-fit focus:outline-hidden justify-start"
	variant="ghost"
	onclick={() => {
		if (!TabsList.find((e) => e.path == path)) {
			TabsList.push({
				path,
				name,
				ext,
			});
		}
		$Active = path;
	}}
>
	<FileText class="size-4! my-auto text-zinc-400" />
	{name}
</Button>
