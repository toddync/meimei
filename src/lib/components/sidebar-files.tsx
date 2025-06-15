//@ts-nocheck
import { SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { File } from "lucide-react"
import { useEffect } from "react"
import { useFilesStore } from "../stores/Files"
import Tree from "./file-tree"

export default function Files({ setContent, active }: { active: boolean, setContent?: (a: any) => {} }) {
    useEffect(() => {
        setContent?.(Content)
    }, [active])

    useEffect(() => {
        const unsubExpanded = useFilesStore.subscribe(
            s => s.expanded,
            (expanded) => {
                localStorage.setItem("file-ui-state", JSON.stringify({
                    expanded,
                    selected: useFilesStore.getState().selected
                }))
            },
            { fireImmediately: true }
        )

        return () => {
            unsubExpanded()
        }
    }, [])

    return (
        <SidebarMenuItem >
            <SidebarMenuButton
                isActive={active}
                className="px-2"
            >
                <File className="!size-4.5" />
                <span>Files</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}

function Content() {
    return (
        <SidebarContent>
            <SidebarGroup className="p-5">
                <SidebarGroupContent>
                    <SidebarMenu>
                        <Tree />
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>
    )
}