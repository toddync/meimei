//@ts-nocheck
import { BlockNoteSchema, defaultBlockSpecs, filterSuggestionItems } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { blockTypeSelectItems, FormattingToolbar, FormattingToolbarController, getDefaultReactSlashMenuItems, SuggestionMenuController, useCreateBlockNote } from "@blocknote/react";
import { MantineProvider } from "@mantine/core";
import { join } from "@tauri-apps/api/path";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import * as Alert from "../editorExt/Alert";
import { toCustom, toDefault } from "../scripts/block-converter";
import { Selection, useFilesStore } from "../stores/files";
import { useMeimeiStore } from "../stores/meimei";
import { Tab } from "../stores/tabs";
import Loader from "./loader";
import Title from "./title";
import { v4 as uuid } from "uuid";

interface EditorPageProps {
    file: { path: string; name: string, directory: string, extension: string }
    tab: Tab
}

export function EditorPage({ file, tab }: EditorPageProps) {
    const editor = useCreateBlockNote();
    const [content, setContent] = useState<string>("");
    const [title, setTitle] = useState<string>(file.name);
    const [editorContent, setEditorContent] = useState<any>(null);

    const [error, setError] = useState<boolean>(false)

    let setSelection = useFilesStore(s => s.setSelection)
    let getSelection = useFilesStore(s => s.getSelection)

    let selection = getSelection(file.path)
    let [id, setId] = useState(uuid())

    const publishChange = useCallback(
        async (markdown: string) => {
            if (markdown !== content) {
                try {
                    await writeTextFile(file.path, markdown);
                } catch (err) {
                    console.error("Failed to write file:", err);
                }
            }
        },
        [file, content]
    );

    const publishSelection = useCallback(async (s: Selection) => {
        setSelection(file.path, s)
    }, [file])

    const renameFile = debounce(async (name: string) => {
        const newPath = await join(file.directory, `${name}.md`)

        if (file.path == newPath) setError(false)
        else setError(!(await useFilesStore.getState().renameFile(file.path, newPath, tab.value)))
    }, 500)

    useEffect(() => {
        // let cancelled = false;

        (async function startEditorPage() {
            try {
                setTitle(file.name);
                setContent("");
                setEditorContent(false);

                const text = await readTextFile(file.path);
                // if (!cancelled) {
                setContent(text);
                const parsed = await editor.tryParseMarkdownToBlocks(text);
                setEditorContent(parsed || []);
                // }
            } catch (err) {
                console.error("Failed to read file:", err);
            }
        })();

        // return () => {
        //     cancelled = true;
        // };
    }, [file]);

    return (
        <div className="flex flex-1 flex-col px-5 pb-10 overflow-auto" id={id}>
            {editorContent ?
                <>
                    <Title value={title} error={error} onChange={(e) => {
                        if (e) {
                            renameFile(e)
                            setTitle(e)
                        } else toast.error("Invalid title", { description: "File can't have an empty title" })
                    }} />
                    <Editor
                        id={id}
                        selection={selection}
                        content={editorContent}
                        publishChange={publishChange}
                        publishSelection={publishSelection}
                    />
                </>
                : <Loader />
            }
        </div>
    );
}

let blockExts = [
    Alert
]

const schema = BlockNoteSchema.create({
    blockSpecs: {
        ...defaultBlockSpecs,
        alert: Alert.Block,
    },
});

interface EditorProps {
    id: string;
    content?: string;
    selection?: Selection;
    publishChange: (markdown: string) => Promise<void>;
    publishSelection?: (s: Selection) => void;
}

export function Editor({ id, content, selection, publishChange, publishSelection }: EditorProps) {
    const setFocus = useMeimeiStore(s => s.setFocus)
    const editor = useCreateBlockNote({
        schema,
        initialContent: content,
        _tiptapOptions: {
            onCreate(e) {
                if (selection)
                    requestAnimationFrame(() => {
                        e.editor.commands.setTextSelection(selection);
                    });
            },

            onSelectionUpdate(e) {
                let editorDiv = document.getElementById(id);
                let editor = e.editor;
                const selection = editor.state.selection.ranges[0];

                publishSelection?.({ from: selection.$from.pos, to: selection.$to.pos })

                if (!editorDiv) return;
                if (selection.$to.pos != selection.$from.pos) return;
                if (selection.$to.pos <= 3) {
                    editorDiv.scrollTo({
                        top: 1,
                        behavior: "smooth"
                    });
                } else {
                    const viewportCoords = editor.view.coordsAtPos(selection.$from.pos);
                    const absoluteOffset = editorDiv?.scrollTop + viewportCoords.top;

                    if (viewportCoords.top > 0.8 * editorDiv?.clientHeight) {
                        editorDiv.scrollTo({
                            top: absoluteOffset - editorDiv?.clientHeight * 0.8,
                            behavior: "smooth"
                        });
                    } else if (viewportCoords.top < 0.3 * editorDiv?.clientHeight) {
                        editorDiv.scrollTo({
                            top: absoluteOffset - editorDiv?.clientHeight * 0.3,
                            behavior: "smooth"
                        });
                    }
                }
            }
        }
    });

    const debouncedPublish = useMemo(
        () => debounce((md: string) => publishChange(md), 100),
        [publishChange]
    );

    const changeHandler = useCallback(async () => {
        const markdown = await editor.blocksToMarkdownLossy(toDefault(editor));
        toCustom(editor)
        debouncedPublish(markdown);
    }, [editor, debouncedPublish]);

    useEffect(() => {
        toCustom(editor)
        setFocus(() => requestAnimationFrame(() => editor.focus()))
        return () => {
            setFocus(undefined)
            debouncedPublish.cancel();
        };
    }, [debouncedPublish]);

    return (
        <MantineProvider>
            <BlockNoteView
                autoFocus
                theme="dark"
                editor={editor}
                content={content}
                onChange={changeHandler}
                formattingToolbar={false} slashMenu={false} sideMenu={false}
            >
                <FormattingToolbarController
                    formattingToolbar={() => (
                        <FormattingToolbar
                            blockTypeSelectItems={[
                                ...blockTypeSelectItems(editor.dictionary),
                                ...(blockExts.map(item => item.info))
                            ]}
                        />
                    )}
                />
                <SuggestionMenuController
                    triggerCharacter={"/"}
                    getItems={async (query) => {
                        const defaultItems = getDefaultReactSlashMenuItems(editor).filter(i => i.title != "Code Block");
                        const lastBasicBlockIndex = defaultItems.findLastIndex((item) => item.group === "Basic blocks") + 1;
                        blockExts.map((item, i) => defaultItems.splice(lastBasicBlockIndex + i, 0, item.insert(editor)))
                        return filterSuggestionItems(defaultItems, query);
                    }}
                />
            </BlockNoteView>
        </MantineProvider>
    );
}