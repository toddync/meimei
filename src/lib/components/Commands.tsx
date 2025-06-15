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
import { File, useFilesStore } from "../stores/Files"
import { Tab, useTabStore } from "../stores/tab-store"

export default function Commands() {
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

    const [fileList, setFileList] = useState({ tabs: [] as Tab[], files: [] as File[] })

    useEffect(() => {
        const orderedTabs = history
            .map(h => tabs.find(t => t.value === h))
            .filter((t): t is Tab => t !== undefined)

        const availableFiles = files.raw.filter(file =>
            tabs.findIndex(tab => tab.value === file.path) === -1
        )

        setFileList({ tabs: orderedTabs, files: availableFiles })
    }, [tabs, history, files])

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                toggle()
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <CommandDialog open={open} onOpenChange={setOpen} showCloseButton={false}>
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
                                    toggle()
                                }}>
                                <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                    {tab.data.name}
                                </span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {fileList.files.length > 0 && (
                    <CommandGroup heading="Files">
                        {fileList.files.map((file, i) => (
                            !file.dir && (
                                <CommandItem
                                    key={i}
                                    onSelect={() => {
                                        addTab({ data: { ...file }, value: file.path, type: "editor" })
                                        select(file.path)
                                        setSelected(file)
                                        toggle()
                                    }}>
                                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                        {file.name}
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
