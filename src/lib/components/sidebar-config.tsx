import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarMenuButton } from "@/components/ui/sidebar"

import { Moon, Settings, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { useMeimeiStore } from "../stores/meimei"

export default function Setting() {
    const [theme, setTheme] = useState<"light" | "dark">((localStorage.getItem("theme") as "light" | "dark") || "dark")
    let focus = useMeimeiStore(s => s.focus)
    let setShowManager = useMeimeiStore(s => s.setShowManager)

    useEffect(() => {
        localStorage.setItem("theme", theme)
        //@ts-ignore
        document.documentElement.classList = theme;
    }, [theme])

    return (
        <DropdownMenu onOpenChange={(o) => !o && focus?.()}>
            <DropdownMenuTrigger>
                <SidebarMenuButton className="px-2">
                    <Settings className="!size-4.5" />
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuItem className="justify-between" onClick={() => setTheme(theme == "dark" ? "light" : "dark")}>
                    Switch Theme {theme == "dark" ? <Moon /> : <Sun />}
                </DropdownMenuItem>
                <DropdownMenuItem className="justify-between" onClick={() => setShowManager(true)}>
                    Manage Gardens
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}