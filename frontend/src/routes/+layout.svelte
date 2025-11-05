<script lang="ts">
	import TopBar from '$lib/components/top-bar.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import '../app.css';
	
	let { children } = $props();
</script>

<main class="h-svh w-svw flex flex-col absolute top-0 left-0 overflow-hidden">
	<TopBar />
	<Toaster richColors  theme="system"/>
	
	<main class="flex flex-1 flex-col mt-8 overflow-auto">
		{@render children?.()}
	</main>
</main>
