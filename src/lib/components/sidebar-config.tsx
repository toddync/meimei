import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarMenuButton } from "@/components/ui/sidebar"

import { Moon, Settings, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export default function Setting() {
    //@ts-ignore
    const [theme, setTheme] = useState<"light" | "dark">(localStorage.getItem("theme") || "dark")

    useEffect(() => {
        localStorage.setItem("theme", theme)
        document.documentElement.classList = theme;
    }, [theme])

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <SidebarMenuButton className="px-2">
                    <Settings className="!size-4.5" />
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem className="justify-between" onClick={() => setTheme(theme == "dark" ? "light" : "dark")}>
                    Switch Theme {theme == "dark" ? <Moon /> : <Sun />}
                </DropdownMenuItem>
                {/* <DropdownMenuSeparator /> */}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}