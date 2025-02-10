//@ts-nocheck
import { Node, markInputRule, mergeAttributes } from "@tiptap/core";
import { SvelteNodeViewRenderer } from "svelte-tiptap";
import CodeBlock from "../components/CodeBlock.svelte";

export const CodeBlockExt = Node.create({
	name: "codeBlock",
	content: "block*",
	group: "block",
	code: true,
	inline: false,
	isolating: true,
	draggable: true,
	whitespace: "pre",
	atom: true,

	addInputRules() {
		return [
			markInputRule({
				find: /```(\w+)\n([\s\S]*?)\n```/,
				type: this.type,
			}),
		];
	},

	addKeyboardShortcuts() {
		return {
			"Mod-Enter": () => {
				return this.editor
					.chain()
					.insertContentAt(this.editor.state.selection.head, {
						type: this.type.name,
					})
					.focus()
					.run();
			},
		};
	},

	addAttributes() {
		return {
			language: {
				default: "javascript",
			},
			code: {
				default: "",
			},
		};
	},

	parseHTML: () => [{ tag: "code-block" }],
	addNodeView: () => SvelteNodeViewRenderer(CodeBlock),
	renderHTML: ({ HTMLAttributes }) => [
		"code-block",
		mergeAttributes(HTMLAttributes),
	],

	addStorage() {
		return {
			markdown: {
				serialize(state, node) {
					const lang = node.attrs.language || "javascript";
					const code = node.attrs.code;
					state.write("```" + lang + "\n");
					state.write(code);
					state.write("\n```");
					state.closeBlock(node);
				},
			},
		};
	},
});
