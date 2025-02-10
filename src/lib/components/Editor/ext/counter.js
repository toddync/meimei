import { Node, mergeAttributes } from "@tiptap/core";
import { SvelteNodeViewRenderer } from "svelte-tiptap";

import Counter from "../components/Counter.svelte";

export const CounterExt = Node.create({
	name: "svelteCounterComponent",
	group: "block",
	atom: true,
	selectable: true,
	inline: false,

	addAttributes() {
		return {
			count: {
				default: 0,
			},
		};
	},

	parseHTML() {
		return [{ tag: "svelte-counter-component" }];
	},

	renderHTML({ HTMLAttributes }) {
		return ["svelte-counter-component", mergeAttributes(HTMLAttributes)];
	},

	addNodeView() {
		return SvelteNodeViewRenderer(Counter);
	},
});
