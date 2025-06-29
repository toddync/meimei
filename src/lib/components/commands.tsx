import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { useEffect, useState } from "react"
import { useCommandStore } from "../stores/command"
import { useFilesStore } from "../stores/files"
import { TreeItem } from "../scripts/load-files"
import { useMeimeiStore } from "../stores/meimei"
import { Tab, useTabStore } from "../stores/tabs"

import { v4 as uuidv4 } from "uuid"

export default function Commands() {
    const store = useMeimeiStore(s => s.workspaceStore)
    const focus = useMeimeiStore(s => s.focus)

    const open = useCommandStore(s => s.open)
    const toggle = useCommandStore(s => s.toggle)
    const setOpen = useCommandStore(s => s.setOpen)

    const files = useFilesStore(s => s.files);
    const setSelected = useFilesStore(s => s.setSelected);

    const tabs = useTabStore(state => state.tabs)
    const history = useTabStore(state => state.history)
    const addTab = useTabStore(state => state.add)
    const value = useTabStore(state => state.value)
    const select = useTabStore(state => state.select)

    const [fileList, setFileList] = useState({ tabs: [] as Tab[], files: [] as TreeItem[] })

    useEffect(() => {
        const orderedTabs = history
            .map(h => tabs.find(t => t.value === h))
            .filter((t): t is Tab => t !== undefined)

        const availableFiles = Object.entries(files.items).map(([_, file]) =>
            (tabs.findIndex(tab => useTabStore.getState().TabDataMap[tab.value].path === file.data.path) === -1 && file) || undefined
        )

        setFileList({ tabs: orderedTabs, files: availableFiles.filter(e => e != undefined) })
    }, [tabs, history, files])

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey) && store) {
                e.preventDefault()
                toggle()
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <CommandDialog open={open} onOpenChange={(o) => {
            setOpen(o)

            if (!o) focus?.()
        }} showCloseButton={false}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                {fileList.tabs.length > 0 && (
                    <CommandGroup heading="Tabs">
                        {fileList.tabs.map((tab, i) => (
                            <CommandItem
                                key={i}
                                className={value === tab.value ? "bg-primary/20 data-[selected=true]:bg-primary/40" : ""}
                                onSelect={() => {
                                    select(tab.value)
                                    setSelected(tab.value)
                                    toggle()
                                    focus?.()
                                }}>
                                <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                    {useTabStore.getState().getData(tab.value)?.name}
                                </span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {fileList.files.length > 0 && (
                    <CommandGroup heading="Files">
                        {fileList.files.map((file, i) => (
                            !file?.isFolder && (
                                <CommandItem
                                    key={i}
                                    onSelect={() => {
                                        addTab({ value: uuidv4(), type: "editor" }, file.data)
                                        select(file?.data.path)
                                        //@ts-ignore
                                        setSelected(file)
                                        toggle()
                                        focus?.()
                                    }}>
                                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                        {file?.data.name}
                                    </span>
                                </CommandItem>
                            )
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </CommandDialog>
    )
}
