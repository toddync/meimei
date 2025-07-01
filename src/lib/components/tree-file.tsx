import { buttonVariants } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuShortcut,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Input } from "@/components/ui/input"
import { dirname, join } from "@tauri-apps/api/path"
import { TreeDataNode } from "antd"
import { File, FileLock2, Image, PenBox, Trash2 } from "lucide-react"
import { ReactNode, useEffect, useState } from "react"
import { toast } from "sonner"
import { useFilesStore } from "../stores/files"
import { cn } from "../utils"

export default function TreeFile({ name, node, setDialogContext, setDialogOpen }: { name: string | ReactNode, node: TreeDataNode, setDialogContext: (i: any) => void, setDialogOpen: (i: any) => void }) {
    let [editing, setEditing] = useState<boolean>(false)
    let [title, setTitle] = useState<string>()
    const selected = useFilesStore(s => s.selected);

    let file = useFilesStore(s => s.files.items[node.key as string])

    useEffect(() => {
        (async () => {
            setTitle(`${node.title}.${file.extension}`)
        })()
    }, [])

    async function rename() {
        if (title) {
            let path = node.key as string
            let dir = await dirname(path)
            let newPath = await join(dir, title)

            useFilesStore.getState().renameFile(path, newPath)
            toast.success("File renamed")
        } else {
            toast.warning("Invalid name", { description: "Files can't have empty names" })
        }
    }

    return <ContextMenu>
        <ContextMenuTrigger>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger className="w-full">
                        {!editing ? (
                            <div
                                className={cn(
                                    buttonVariants({ variant: "ghost" }),
                                    'justify-start min-w-fit w-full hover:bg-primary/10',
                                    selected == node.key && "bg-primary/20"
                                )}
                            >
                                <span className='*:text-muted-foreground *:size-40'>
                                    {
                                        file.extension == "md" && <File /> ||
                                        ["png", "jpg", "jpeg"].includes(file.extension || "") && <Image /> ||
                                        <FileLock2 className="stroke-red-400" />
                                    }
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
                                        setTitle(`${node.title}.${file.extension}`);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') {
                                            setEditing(false);
                                            setTitle(`${node.title}.${file.extension}`);
                                        } else if (e.key === 'Enter') {
                                            e.preventDefault(); // Prevent form submission if inside <form>
                                            setEditing(false);
                                            rename()
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </TooltipTrigger>
                    {file.extension != "md" && !["png", "jpg", "jpeg"].includes(file.extension || "") &&
                        <TooltipContent className="border-red-400/50 border">
                            Can't open ".{file.extension}" files yet.
                        </TooltipContent>
                    }
                </Tooltip>
            </TooltipProvider>
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