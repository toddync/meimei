//@ts-nocheck
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";

export function toCustom(editor: BlockNoteEditor) {
    editor.forEachBlock((block) => {
        if (block.type == "codeBlock") {
            let [type, props] = block.props.language.split("|");
            props = JSON.parse(props || "{}")

            editor.replaceBlocks([block.id], [{ ...block, type, props }])
        }
        return true;
    }, false)
}

const customTypes = ["alert"]
export function toDefault(editor: BlockNoteEditor): PartialBlock[] {
    return editor.document.map((block) => {
        if (customTypes.includes(block.type)) {
            block = {
                ...block,
                type: "codeBlock",
                props: {
                    language: block.type + "|" + JSON.stringify(block.props || "{}"),
                }
            }
        }

        return block
    })
}