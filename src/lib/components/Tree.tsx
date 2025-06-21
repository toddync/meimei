import { Button, buttonVariants } from '@/components/ui/button'
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuShortcut,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input'
import { join } from '@tauri-apps/api/path'
import type { TreeProps } from 'antd'
import { ConfigProvider, Tree } from 'antd'
import type { DataNode } from 'antd/es/tree'
import { ChevronRight, File, FilePlus, Folder, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useFilesStore } from '../stores/Files'
import { useMeimeiStore } from '../stores/meimeiStore'
import { useTabStore } from '../stores/tab-store'
import { cn } from '../utils'
import FileDialog from './file-dialog'

interface FileTreeProps {
    treeData: {
        rootId: string
        items: Record<string, any>
    }
}

export function FileTree({ treeData }: FileTreeProps) {
    const setExpanded = useFilesStore(s => s.setExpanded);
    const selected = useFilesStore(s => s.selected);
    const setSelected = useFilesStore(s => s.setSelected);
    const addTab = useTabStore(s => s.add);
    const selectTab = useTabStore(s => s.select);

    const setDialogOpen = useFilesStore(s => s.setDialogOpen)
    const setDialogContext = useFilesStore(s => s.setDialogContext)

    const antTreeData: DataNode[] = convertToAntTree(treeData)?.[0]?.children || []

    const onSelect: TreeProps['onSelect'] = (_, { node }) => {
        if (node.isLeaf) {
            let path = node.key as string;
            addTab({ data: treeData.items[path].data, value: path, type: "editor" });
            selectTab(path);
            setSelected(path);
        }
    }

    const [searchValue, setSearchValue] = useState("")
    const [expandedKeys, setExpandedKeys] = useState<string[]>((() => {
        return Object.entries(useFilesStore.getState().expanded).filter(([_, v]) => v).map(([k]) => k)
    })())
    const [autoExpandParent, setAutoExpandParent] = useState(true)

    const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target
        setSearchValue(value)

        const matchedKeys = Object.keys(treeData.items).filter(key =>
            (treeData.items[key].data?.filename || "")
                .toLowerCase()
                .includes(value.toLowerCase())
        )
        setExpandedKeys(matchedKeys)
        setAutoExpandParent(true)
    }

    const handleDrop: TreeProps['onDrop'] = info => {
        const dragKey = info.dragNode.key as string
        const dropKey = info.node.key as string

        console.log("Dragged:", dragKey)
        console.log("Dropped on:", dropKey)
    }

    useEffect(() => {
        setExpanded(expandedKeys)
    }, [expandedKeys])

    return <>
        <div className='flex gap-2 pt-2'>
            <Input
                placeholder="Search files..."
                onChange={onSearch}
                className="mb-2 border rounded-md px-3 py-1 text-sm"
            />
            <FileDropdown />
        </div>
        <FileDialog />
        <ConfigProvider
            theme={{
                token: { colorBgContainer: "rgba(0,0,0,0)" },
                components: {
                    Tree: {
                        nodeHoverBg: "rgba(0,0,0,0)",
                        nodeSelectedBg: "rgba(255, 32, 86, 0)"
                    },
                }
            }}>
            <Tree
                className='overflow-auto h-full'
                // draggable
                onDrop={handleDrop}
                onSelect={onSelect}
                treeData={antTreeData}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                onExpand={(e) => {
                    setExpandedKeys(e as string[]);
                    setAutoExpandParent(false);
                }}
                switcherIcon={(e) =>
                    <ChevronRight
                        data-expanded={e.expanded || undefined}
                        className='data-[expanded]:rotate-90 transition-all stroke-muted-foreground size-4 my-auto mx-auto'
                    />
                }
                titleRender={(node) => {
                    const title = node.title as string
                    const matchIndex = title
                        .toLowerCase()
                        .indexOf(searchValue.toLowerCase())

                    // const match = title.substring(matchIndex, matchIndex + searchValue.length)
                    let displayTitle = title
                    if (searchValue && matchIndex !== -1) {
                        const before = title.substring(0, matchIndex)
                        const match = title.substring(matchIndex, matchIndex + searchValue.length)
                        const after = title.substring(matchIndex + searchValue.length)

                        //@ts-ignore
                        displayTitle = (
                            <span>
                                {before}
                                <span className="bg-yellow-300 dark:bg-yellow-600 rounded px-0.5">{match}</span>
                                {after}
                            </span>
                        )
                    }
                    return (
                        <ContextMenu>
                            <ContextMenuTrigger>
                                <div className={cn(buttonVariants({ variant: "ghost" }), 'justify-start min-w-fit w-full hover:bg-primary/10', selected == node.key && "bg-primary/20")}>
                                    <span className='*:text-muted-foreground *:size-40'>
                                        {node.isLeaf ? <File /> : <Folder />}
                                    </span>
                                    <span className="whitespace-nowrap text-foreground">{displayTitle}</span>
                                </div>
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
                            </ContextMenuContent>
                        </ContextMenu>
                    )
                }}
            />
        </ConfigProvider>
    </>

}

function convertToAntTree(tree: {
    rootId: string
    items: Record<string, any>
}): DataNode[] {
    const items = tree.items

    function buildNode(id: string): DataNode {
        const item = items[id]
        return {
            title: item.data?.name || 'Untitled',
            key: id,
            isLeaf: !item.isFolder,
            selectable: !item.isFolder,
            children: item.children?.map(buildNode),
        }
    }

    return [buildNode(tree.rootId)]
}


function FileDropdown() {
    const [open, setOpen] = useState<boolean>(false)
    const [title, setTitle] = useState<string>()

    const addFile = useFilesStore(s => s.addFile)
    const root = useMeimeiStore(s => s.workRoot)

    const setSelected = useFilesStore(s => s.setSelected)
    const select = useTabStore(s => s.select)
    const addTab = useTabStore(s => s.add)

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger className={buttonVariants({ variant: "default", size: "icon" })}>
                <Plus
                    data-open={open || undefined}
                    className='data-[open]:rotate-45 transition-all'
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        New note
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className='flex gap-1'>
                        <Input autoFocus placeholder='Note Title...' value={title} onChange={e => setTitle(e.target.value)} />
                        <Button size="icon"
                            onClick={async () => {
                                if (title) {
                                    try {
                                        let path = await join(root, `${title}.md`)

                                        console.log(path)
                                        await addFile(path)
                                        addTab({
                                            data: {
                                                path,
                                                name: title,
                                                extension: "md",
                                                directory: root
                                            }, value: path, type: "editor"
                                        })
                                        select(path)
                                        setSelected(path)

                                        setTitle(undefined)
                                        setOpen(false)
                                    } catch (error) {
                                        console.error(error)
                                        toast.error("Error creating file", { description: "It appears there was a error creating this file" })
                                    }
                                } else toast.warning("Please fill the title", { description: "You need to fill the title" })
                            }}
                        >
                            <FilePlus />
                        </Button>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                {/* <DropdownMenuItem>New folder</DropdownMenuItem> */}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}