import type { Extensions } from "@tiptap/core";
import CharacterCount from "@tiptap/extension-character-count";
import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, EditorContext, useEditor } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import React, { useMemo } from 'react';
import { Markdown } from "tiptap-markdown";
// import mark from "@/exts/tag";
// import { meimeiStore } from "@/stores/meimei.svelte";
// import { GetFileContent } from "@/wailsjs/go/main/App";

const extensions: Extensions = [
  // mark,

  CharacterCount,
  Color.configure({ types: [TextStyle.name, ListItem.name] }), //@ts-ignore
  TextStyle.configure({ types: [ListItem.name] }),
  Markdown.configure({
    // html: true,
    // tightLists: true,
    bulletListMarker: "-",
    linkify: true,
    breaks: true,
    transformPastedText: true,
    transformCopiedText: true
  }),
  TextAlign.configure({
    defaultAlignment: "left",
    types: ["heading", "paragraph"],
    alignments: ["left", "center", "right", "justify"]
  }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true
    },
    orderedList: {
      keepMarks: true
    },
    // heading: {
    //     // levels: [1, 2, 3]
    // },
    codeBlock: false,
    code: false
  })
] as Extensions;

const Tiptap = () => {
  const editor = useEditor({
    extensions, // define your extension array
    content: '<h1>Hello World!</h1>', // initial content
  })

  // Memoize the provider value to avoid unnecessary re-renders
  const providerValue = useMemo(() => ({ editor }), [editor])

  return (
    <EditorContext.Provider value={providerValue}>
      <EditorContent editor={editor} />
      <FloatingMenu className='text-muted-foreground' editor={editor}>This is the floating menu</FloatingMenu>
      <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>
    </EditorContext.Provider>
  )
}

export default Tiptap