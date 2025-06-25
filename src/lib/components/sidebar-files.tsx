//@ts-nocheck
import { SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { File } from "lucide-react"
import { useEffect } from "react"
import { useFilesStore } from "../stores/files"

export default function Files({ setContent, active }: { active: boolean, setContent?: (a: any) => {} }) {
    const files = useFilesStore(s => s.setFiles);

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

function Content({ files }) {
    return (
        <SidebarContent>
            <SidebarGroup className="p-5">
                <SidebarGroupContent>
                    <SidebarMenu>
                        {files && <FileTree treeData={files} />}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>
    )
}