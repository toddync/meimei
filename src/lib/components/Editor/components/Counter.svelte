<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import { Input } from "$lib/components/ui/input";
	import type { NodeViewProps } from "@tiptap/core";
	import { NodeViewWrapper } from "svelte-tiptap";

	let { node, updateAttributes, selected }: NodeViewProps = $props();

	const onclick = () => {
		updateAttributes({ count: node.attrs.count + 1 });
		console.log(node.toString());
	};

	$inspect(selected);
</script>

<NodeViewWrapper>
	<div class="hover:*:bg-red-900 border">
		<Card.Root>
			<Card.Header>
				<Card.Title>Svelte Component</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if selected}
					<Input autofocus />
				{/if}
				<Button {onclick}>
					This button has been clicked {node.attrs.count} times.
				</Button>
			</Card.Content>
		</Card.Root>
	</div>
</NodeViewWrapper>
