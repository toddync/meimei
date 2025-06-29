import { buttonVariants } from "@/components/ui/button"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuShortcut,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Input } from "@/components/ui/input"
import { TreeDataNode } from "antd"
import { File, PenBox, Trash2 } from "lucide-react"
import { ReactNode, useEffect, useState } from "react"
import { cn } from "../utils"
import { dirname, extname, join } from "@tauri-apps/api/path"
import { useFilesStore } from "../stores/files"
import { toast } from "sonner"

export default function TreeFile({ name, node, selected, setDialogContext, setDialogOpen }: { name: string | ReactNode, node: TreeDataNode, selected: string, setDialogContext: (i: any) => void, setDialogOpen: (i: any) => void }) {
    let [editing, setEditing] = useState<boolean>(false)
    let [extension, setExtension] = useState<string>()
    let [title, setTitle] = useState<string>()

    useEffect(() => {
        (async () => {
            let ext = await extname(node.key as string)
            setExtension(ext)
            setTitle(`${node.title}.${ext}`)
        })()
    }, [])

    async function rename() {
        if (title) {
            let path = node.key as string
            let dir = await dirname(path)
            let newPath = await join(dir, title)

            useFilesStore.getState().renameFile(path, newPath)
        } else {
            toast.warning("Invalid name", { description: "Files can't have empty names" })
        }
    }

    return <ContextMenu>
        <ContextMenuTrigger>
            {!editing ? (
                <div
                    className={cn(
                        buttonVariants({ variant: "ghost" }),
                        'justify-start min-w-fit w-full hover:bg-primary/10',
                        selected == node.key && "bg-primary/20"
                    )}
                >
                    <span className='*:text-muted-foreground *:size-40'>
                        <File />
                    </span>
                    <span className="whitespace-nowrap text-foreground">{name}</span>
                </div>
            ) : (
                <div onClick={(e) => e.stopPropagation()}>
                    <Input
                        autoFocus
                        value={title}
                        placeholder="File name..."
                        className="text-foreground"
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => {
                            setEditing(false);
                            setTitle(`${node.title}.${extension}`);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                setEditing(false);
                                setTitle(`${node.title}.${extension}`);
                            } else if (e.key === 'Enter') {
                                e.preventDefault(); // Prevent form submission if inside <form>
                                setEditing(false);
                                rename()
                            }
                        }}
                    />
                </div>
            )}

        </ContextMenuTrigger>
        <ContextMenuContent onClick={(e) => (e.stopPropagation())}>
            <ContextMenuItem onSelect={() => {
                setDialogContext({
                    action: "delete",
                    path: node.key
                })
                setDialogOpen(true)
            }}>
                Delete
                <ContextMenuShortcut>
                    <Trash2 />
                </ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => {
                setEditing(true)
            }}>
                Rename
                <ContextMenuShortcut>
                    <PenBox />
                </ContextMenuShortcut>
            </ContextMenuItem>
        </ContextMenuContent>
    </ContextMenu>
}