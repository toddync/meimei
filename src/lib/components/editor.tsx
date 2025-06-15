//@ts-nocheck
import { BlockNoteSchema, defaultBlockSpecs, filterSuggestionItems } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { blockTypeSelectItems, FormattingToolbar, FormattingToolbarController, getDefaultReactSlashMenuItems, SuggestionMenuController, useCreateBlockNote } from "@blocknote/react";
import { MantineProvider } from "@mantine/core";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as Alert from "../editorExt/Alert";
import Title from "./title";
import { Flower } from "lucide-react";

interface EditorPageProps {
    file: { path: string; name: string, directory: string, extension: string };
}

export function EditorPage({ file }: EditorPageProps) {
    const [content, setContent] = useState<string>("");
    const [editorContent, setEditorContent] = useState<any>(null);
    const [title, setTitle] = useState<string>(file.name);
    const editor = useCreateBlockNote();

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
        [file.path, content]
    );

    async function renameFile(name: string) {
        console.log(file.directory + name + "." + file.extension);
        setTitle(name);
        // await rename(file.path, file.directory + name);
    }

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setTitle(file.name);
                setContent("");
                setEditorContent(false);

                const text = await readTextFile(file.path);
                if (!cancelled) {
                    setContent(text);
                    const parsed = await editor.tryParseMarkdownToBlocks(text);
                    setEditorContent(parsed || []);
                }
            } catch (err) {
                console.error("Failed to read file:", err);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [file]);

    return (
        <div className="flex flex-1 flex-col p-5 pt-10  overflow-scroll">
            <Title value={title} onChange={renameFile} />
            {editorContent ?
                <Editor
                    content={editorContent}
                    publishChange={publishChange}
                />
                : <div className="mx-auto my-auto w-fit">
                    <Flower className="stroke-primary animate-spin" />
                </div>
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
    content?: string;
    publishChange: (markdown: string) => Promise<void>;
}

export function Editor({ content, publishChange }: EditorProps) {
    //@ts-ignore
    const editor = useCreateBlockNote({ initialContent: content, schema });

    const debouncedPublish = useMemo(
        () => debounce((md: string) => publishChange(md), 100),
        [publishChange]
    );

    const changeHandler = useCallback(async () => {
        const markdown = await editor.blocksToMarkdownLossy(editor.document);
        debouncedPublish(markdown);
    }, [editor, debouncedPublish]);

    useEffect(() => {
        return () => {
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
                        //@ts-ignore
                        const lastBasicBlockIndex = defaultItems.findLastIndex((item) => item.group === "Basic blocks") + 1;
                        //@ts-ignore
                        blockExts.map((item, i) => defaultItems.splice(lastBasicBlockIndex + i, 0, item.insert(editor)))
                        return filterSuggestionItems(defaultItems, query);
                    }}
                />
            </BlockNoteView>
        </MantineProvider>
    );
}