<script lang="ts">
	//@ts-nocheck
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import {
		AlignCenter,
		AlignJustify,
		AlignLeft,
		AlignRight,
		Bold,
		Heading,
		Heading1,
		Heading2,
		Heading3,
		Italic,
		List,
		ListOrdered,
		ListTodo,
		Quote,
		Strikethrough,
		Type,
	} from "lucide-svelte";
	import { BubbleMenu } from "svelte-tiptap";
	import * as Accordion from "../ui/accordion";
	import * as Popover from "../ui/popover";
	import type { Editor } from "@tiptap/core";

	const sleep = (delay) =>
		new Promise((resolve) => setTimeout(resolve, delay));

	let { editor }: { editor: Editor } = $props();
</script>

{#if editor}
	<BubbleMenu
		{editor}
		tippyOptions={{
			zIndex: 10,
			placement: "top",
			maxWidth: "calc(100vw - 16px)",
			interactive: true,
			// getReferenceClientRect: () => {
			// 	const {
			// 		state: {
			// 			selection: { from, to },
			// 		},
			// 		view,
			// 	} = editor;

			// 	const fromCoords = view.coordsAtPos(from);
			// 	const fromp1Coords = view.coordsAtPos(from + 1);
			// 	const toCoords = view.coordsAtPos(to);

			// 	return {
			// 		width: 1,
			// 		height: 100,
			// 		left:
			// 			fromCoords.top < fromp1Coords.top
			// 				? fromp1Coords.left
			// 				: fromCoords.left +
			// 					(toCoords.left - fromCoords.left) / 2,
			// 		top:
			// 			fromCoords.top < fromp1Coords.top
			// 				? fromp1Coords.top
			// 				: fromCoords.top,
			// 	};
			// },
			// onHide: () => {
			// 	let { from, to } = editor?.state?.selection || {
			// 		from: 0,
			// 		to: 1,
			// 	};
			// 	return from == to;
			// },
		}}
	>
		<!-- shouldShow={({ from, to }) => {
			return from != to;
		}} -->
		<Card.Root>
			<Card.Content class="flex gap-2 p-1">
				<Popover.Root>
					<Popover.Trigger asChild>
						<Button variant="ghost" size="icon">
							<Heading />
						</Button>
					</Popover.Trigger>
					<Popover.Content class="p-1 w-fit">
						<Button
							variant="ghost"
							onclick={() =>
								editor
									.chain()
									.focus()
									.toggleHeading({ level: 1 })
									.run()}
						>
							<Heading1 />
						</Button>
						<Button
							variant="ghost"
							onclick={() =>
								editor
									.chain()
									.focus()
									.toggleHeading({ level: 2 })
									.run()}
						>
							<Heading2 />
						</Button>
						<Button
							variant="ghost"
							onclick={() =>
								editor
									.chain()
									.focus()
									.toggleHeading({ level: 3 })
									.run()}
						>
							<Heading3 />
						</Button>
					</Popover.Content>
				</Popover.Root>

				<Popover.Root>
					<Popover.Trigger asChild>
						<Button variant="ghost" size="icon">
							<Type />
						</Button>
					</Popover.Trigger>
					<Popover.Content class="p-1 w-fit">
						<Button
							variant="ghost"
							onclick={() =>
								editor.chain().focus().toggleBold().run()}
						>
							<Bold />
						</Button>

						<Button
							variant="ghost"
							onclick={() =>
								editor.chain().focus().toggleItalic().run()}
						>
							<Italic />
						</Button>

						<Button
							variant="ghost"
							onclick={() =>
								editor.chain().focus().toggleStrike().run()}
						>
							<Strikethrough />
						</Button>
					</Popover.Content>
				</Popover.Root>

				<Popover.Root>
					<Popover.Trigger asChild>
						<Button variant="ghost" size="icon">
							<AlignLeft />
						</Button>
					</Popover.Trigger>
					<Popover.Content class="p-1 w-fit">
						<Button
							variant="ghost"
							onclick={() =>
								editor.commands.setTextAlign("justify")}
						>
							<AlignJustify />
						</Button>
						<Button
							variant="ghost"
							onclick={() =>
								editor.commands.setTextAlign("center")}
						>
							<AlignCenter />
						</Button>
						<Button
							variant="ghost"
							onclick={() => editor.commands.setTextAlign("left")}
						>
							<AlignLeft />
						</Button>
						<Button
							variant="ghost"
							onclick={() =>
								editor.commands.setTextAlign("right")}
						>
							<AlignRight />
						</Button>
					</Popover.Content>
				</Popover.Root>

				<Popover.Root
					onOpenChange={async () => {
						await sleep(200);
						let l = document.querySelector("#list");
						if (l) {
							let { x, y } = l.getBoundingClientRect();
							l.computedStyleMap.position = "fixed";
							l.style.top = Math.floor(y);
							l.style.left = Math.floor(x);
						}
					}}
				>
					<Popover.Trigger asChild>
						<Button variant="ghost" size="icon">
							<ListTodo />
						</Button>
					</Popover.Trigger>
					<Popover.Content class="p-1 w-fit" id="list">
						<Button
							variant="ghost"
							onclick={() =>
								editor.chain().focus().toggleBulletList().run()}
						>
							<List /> Bullet list
						</Button>
						<Button
							variant="ghost"
							onclick={() =>
								editor
									.chain()
									.focus()
									.toggleOrderedList()
									.run()}
						>
							<ListOrdered /> Ordered list
						</Button>
					</Popover.Content>
				</Popover.Root>

				<Button
					onclick={() => {
						editor.chain().focus().toggleBlockquote().run();
					}}
					variant="ghost"
					size="icon"
				>
					<Quote />
				</Button>
			</Card.Content>
		</Card.Root>
	</BubbleMenu>
{/if}
