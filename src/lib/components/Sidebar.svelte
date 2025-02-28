<script lang="ts">
	//@ts-nocheck
	import * as Sidebar from "$lib/components/ui/sidebar";
	import { innerWidth } from "svelte/reactivity/window";
	import FileTree from "./FileTree.svelte";
	import { SIDEBAR_WIDTH } from "./ui/sidebar/constants";

	let dragging = $state(false);

	if (localStorage.getItem("sidebar:size"))
		$SIDEBAR_WIDTH = localStorage.getItem("sidebar:size");
	else localStorage.setItem("sidebar:size", "256px");

	$effect(() => {
		localStorage.setItem("sidebar:size", $SIDEBAR_WIDTH);
	});
</script>

<svelte:window
	onresize={() => {
		$SIDEBAR_WIDTH = `${Math.min(parseFloat($SIDEBAR_WIDTH.replace("px", "")), innerWidth.current * 0.7)}px`;
	}}
	onmouseup={() => (dragging = false)}
	onmousemove={async (e) => {
		e.preventDefault();
		if (!dragging) return;
		let x = e.clientX + e.movementX;

		$SIDEBAR_WIDTH = `${Math.max(256, Math.min(x - 48, innerWidth.current * 0.7))}px`;
	}}
/>
<Sidebar.Root class="flex-1 mt-10 ml-[3rem]">
	<Sidebar.Content class="pt-3">
		<FileTree />
	</Sidebar.Content>

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		data-dragging={dragging || null}
		onmousedown={() => (dragging = true)}
		class="right-0 z-50 absolute data-dragging:bg-pink-900 hover:bg-pink-900 w-2 h-full transition-colors translate-x-1/2 cursor-move"
	></div>
</Sidebar.Root>
