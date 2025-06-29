import { Button, buttonVariants } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input'
import { dirname, join } from '@tauri-apps/api/path'
import { lstat } from '@tauri-apps/plugin-fs'
import type { TreeProps } from 'antd'
import { ConfigProvider, Tree } from 'antd'
import type { DataNode } from 'antd/es/tree'
import { ChevronRight, FilePlus, FolderPlus, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { v4 as uuid } from 'uuid'
import { useFilesStore } from '../stores/files'
import { useMeimeiStore } from '../stores/meimei'
import { useTabStore } from '../stores/tabs'
import FileDialog from './file-dialog'
import TreeFile from './tree-file'
import TreeFolder from './tree-folder'
import { Separator } from '@/components/ui/separator'

interface FileTreeProps {
    treeData: {
        rootId: string
        items: Record<string, any>
    }
}

export function FileTree({ treeData }: FileTreeProps) {
    const setExpanded = useFilesStore(s => s.setExpanded);

    const setSelected = useFilesStore(s => s.setSelected);
    const addTab = useTabStore(s => s.add);
    const selectTab = useTabStore(s => s.select);

    const setDialogOpen = useFilesStore(s => s.setDialogOpen)
    const setDialogContext = useFilesStore(s => s.setDialogContext)

    const antTreeData: DataNode[] = convertToAntTree(treeData)?.[0]?.children || []

    const onSelect: TreeProps['onSelect'] = (_, { node }) => {
        if (node.isLeaf) {
            let path = node.key as string;
            addTab({ value: uuid(), type: "editor" }, treeData.items[path].data);
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
        const dropKey = info.node.key as string;


        (async () => {
            let dropInfo = await lstat(dropKey)
            let dir = await dirname(dropKey);
            if (!dropInfo.isDirectory || info.dropPosition == -1) useFilesStore.getState().reparentFile(dragKey, dir)
            else useFilesStore.getState().reparentFile(dragKey, dropKey)
        })()
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
                className='overflow-auto h-full flex flex-col'
                draggable
                onDrop={handleDrop}
                onSelect={onSelect}
                treeData={antTreeData}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                onDragOver={({ node }) => setExpandedKeys(keys => (!keys.includes(node.key as string) && keys.push(node.key as string), [...keys]))}
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

                    let displayTitle = title
                    if (searchValue && matchIndex !== -1) {
                        const before = title.substring(0, matchIndex)
                        const match = title.substring(matchIndex, matchIndex + searchValue.length)
                        const after = title.substring(matchIndex + searchValue.length)

                        //@ts-ignore
                        displayTitle = (
                            <span>
                                {before}
                                <span className="bg-yellow-300 dark:text-black rounded px-0.5">{match}</span>
                                {after}
                            </span>
                        )
                    }
                    return (
                        node.isLeaf ?
                            <TreeFile name={displayTitle} node={node} setDialogContext={setDialogContext} setDialogOpen={setDialogOpen} />
                            :
                            <TreeFolder name={displayTitle} node={node} setDialogContext={setDialogContext} setDialogOpen={setDialogOpen} />
                    )
                }}
                dropIndicatorRender={() => <Separator />}
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
                                        await addFile(path)
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
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        New folder
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className='flex gap-1'>
                        <Input autoFocus placeholder='Folder Name...' value={title} onChange={e => setTitle(e.target.value)} />
                        <Button size="icon"
                            onClick={async () => {
                                if (title) {
                                    try {
                                        let path = await join(root, `${title}`)
                                        await addFile(path, true)
                                        setTitle(undefined)
                                        setOpen(false)
                                    } catch (error) {
                                        console.error(error)
                                        toast.error("Error creating folder", { description: "It appears there was a error creating this folder" })
                                    }
                                } else toast.warning("Please fill the title", { description: "You need to fill the title" })
                            }}
                        >
                            <FolderPlus />
                        </Button>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}