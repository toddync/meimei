import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { TerminalSquare } from "lucide-react"
import { useCommandStore } from "../stores/command"

export default function Command() {
    const open = useCommandStore(s => s.open)
    const toggle = useCommandStore(s => s.toggle)
    return (
        <SidebarMenuItem>
            <SidebarMenuButton isActive={open} onClick={toggle} className="px-2">
                <TerminalSquare className="!size-4.5" />
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}