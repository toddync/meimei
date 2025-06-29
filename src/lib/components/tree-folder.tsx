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
import { Folder, Trash2 } from "lucide-react"
import { ReactNode, useState } from "react"
import { cn } from "../utils"

export default function TreeFolder({ name, node, selected, setDialogContext, setDialogOpen }: { name: string | ReactNode, node: TreeDataNode, selected: string, setDialogContext: (i: any) => void, setDialogOpen: (i: any) => void }) {
    let [editing, setEditing] = useState<boolean>(false)
    return <ContextMenu>
        <ContextMenuTrigger>
            {!editing ?
                <div className={cn(buttonVariants({ variant: "ghost" }), 'justify-start min-w-fit w-full hover:bg-primary/10 px-1', selected == node.key && "bg-primary/20")}>
                    <span className='*:text-muted-foreground *:size-40'>
                        <Folder />
                    </span>
                    <span className="whitespace-nowrap text-foreground">{name}</span>
                </div>
                : <Input autoFocus onBlur={() => setEditing(false)} />
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
            {/* <ContextMenuItem onSelect={() => {
                setEditing(true)
            }}>
                Rename
                <ContextMenuShortcut>
                    <PenBox />
                </ContextMenuShortcut>
            </ContextMenuItem> */}
        </ContextMenuContent>
    </ContextMenu>
}