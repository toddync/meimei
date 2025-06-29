import { Button, buttonVariants } from "@/components/ui/button"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Input } from "@/components/ui/input"
import { dirname, join } from "@tauri-apps/api/path"
import { TreeDataNode } from "antd"
import { FilePlus, Folder, FolderPlus, PenBox, Trash2 } from "lucide-react"
import { ReactNode, useState } from "react"
import { toast } from "sonner"
import { useFilesStore } from "../stores/files"
import { useTabStore } from "../stores/tabs"
import { cn } from "../utils"

export default function TreeFolder({ name, node, setDialogContext, setDialogOpen }: { name: string | ReactNode, node: TreeDataNode, setDialogContext: (i: any) => void, setDialogOpen: (i: any) => void }) {
    const selected = useFilesStore(s => s.selected);
    let [editing, setEditing] = useState<boolean>(false)
    let [title, setTitle] = useState<string>(node.title as string);

    async function rename() {
        if (title) {
            let path = node.key as string
            let dir = await dirname(path)
            let newPath = await join(dir, title)

            useFilesStore.getState().renameFile(path, newPath)
            toast.success("Folder renamed")
        } else {
            toast.warning("Invalid name", { description: "Folders can't have empty names" })
        }
    }

    return <ContextMenu>
        <ContextMenuTrigger>
            {!editing ?
                <div className={cn(buttonVariants({ variant: "ghost" }), 'justify-start min-w-fit w-full hover:bg-primary/10 px-1', selected == node.key && "bg-primary/20")}>
                    <span className='*:text-muted-foreground *:size-40'>
                        <Folder />
                    </span>
                    <span className="whitespace-nowrap text-foreground">{name}</span>
                </div>
                :
                <Input autoFocus className="text-foreground"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onBlur={() => {
                        setTitle(node.title as string)
                        setEditing(false)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            setEditing(false);
                            setTitle(node.title as string)

                        } else if (e.key === 'Enter') {
                            e.preventDefault(); // Prevent form submission if inside <form>
                            setEditing(false);
                            rename()
                        }
                    }}
                />
            }
        </ContextMenuTrigger>
        <ContextMenuContent>
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
            <ContextMenuSeparator />
            <AddActions root={node.key as string} />
        </ContextMenuContent>
    </ContextMenu>
}


function AddActions({ root }: { root: string }) {
    const [title, setTitle] = useState<string>()

    const setSelected = useFilesStore(s => s.setSelected)
    const select = useTabStore(s => s.select)
    const addTab = useTabStore(s => s.add)

    async function addFile() {
        if (title) {
            try {
                let path = await join(root, `${title}.md`)
                await useFilesStore.getState().addFile(path)
                addTab({
                    value: path, type: "editor"
                }, {
                    path,
                    name: title,
                    extension: "md",
                    directory: root
                })
                select(path)
                setSelected(path)

                setTitle(undefined)
            } catch (error) {
                console.error(error)
                toast.error("Error creating file", { description: "It appears there was a error creating this file" })
            }
        } else toast.warning("Please fill the title", { description: "You need to fill the title" })
    }

    async function addFolder() {
        if (title) {
            try {
                let path = await join(root, `${title}`)
                await useFilesStore.getState().addFile(path, true)
                setTitle(undefined)
            } catch (error) {
                console.error(error)
                toast.error("Error creating folder", { description: "It appears there was a error creating this folder" })
            }
        } else toast.warning("Please fill the title", { description: "You need to fill the title" })
    }

    return (
        <>
            <ContextMenuSub>
                <ContextMenuSubTrigger>
                    New note
                </ContextMenuSubTrigger>
                <ContextMenuSubContent className='flex gap-1'>
                    <Input autoFocus placeholder='Note Title...' value={title} onChange={e => setTitle(e.target.value)} onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            addFile()
                        }
                    }} />
                    <Button size="icon" onClick={addFile} >
                        <FilePlus />
                    </Button>
                </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSub>
                <ContextMenuSubTrigger>
                    New folder
                </ContextMenuSubTrigger>
                <ContextMenuSubContent className='flex gap-1'>
                    <Input autoFocus placeholder='Folder Name...' value={title} onChange={e => setTitle(e.target.value)} onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            addFolder()
                        }
                    }} />
                    <Button size="icon" onClick={addFolder}>
                        <FolderPlus />
                    </Button>
                </ContextMenuSubContent>
            </ContextMenuSub>
        </>
    )
}