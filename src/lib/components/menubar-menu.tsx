import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarRadioGroup,
    MenubarRadioItem,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger
} from "@/components/ui/menubar"
import { sep } from "@tauri-apps/api/path"
import { useMeimeiStore } from "../stores/meimei"

export default function MenubarMenu_() {
    let root = useMeimeiStore(s => s.workRoot)
    let workspaces = useMeimeiStore(s => s.workspaces)
    let focus = useMeimeiStore(s => s.focus)
    const setShowManager = useMeimeiStore(s => s.setShowManager)
    const toggleSidebar = useMeimeiStore(s => s.toggleSidebar)
    const addWorkspace = useMeimeiStore(s => s.addWorkspace)

    return (
        <Menubar
            onValueChange={(e) => !e && focus?.()}
            className="*:bg-accent *:focus:bg-primary/50 *:data-[state=open]:bg-primary/50 bg-accent border-0"
        >
            {/* <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>
                        New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>
                        New Window <MenubarShortcut>⌘N</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem disabled>New Incognito Window</MenubarItem>
                    <MenubarSeparator />
                    <MenubarSub>
                        <MenubarSubTrigger>Share</MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarItem>Email link</MenubarItem>
                            <MenubarItem>Messages</MenubarItem>
                            <MenubarItem>Notes</MenubarItem>
                        </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSeparator />
                    <MenubarItem>
                        Print... <MenubarShortcut>⌘P</MenubarShortcut>
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu> */}
            {/* <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>
                        Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>
                        Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarSub>
                        <MenubarSubTrigger>Find</MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarItem>Search the web</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Find...</MenubarItem>
                            <MenubarItem>Find Next</MenubarItem>
                            <MenubarItem>Find Previous</MenubarItem>
                        </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSeparator />
                    <MenubarItem>Cut</MenubarItem>
                    <MenubarItem>Copy</MenubarItem>
                    <MenubarItem>Paste</MenubarItem>
                </MenubarContent>
            </MenubarMenu> */}
            <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem inset onSelect={() => window.location.href = window.location.href}>
                        Reload <MenubarShortcut>⌘R</MenubarShortcut>
                    </MenubarItem>
                    {/* <MenubarSeparator /> */}
                    <MenubarItem inset onSelect={toggleSidebar}>Toggle Sidebar <MenubarShortcut>⌘/</MenubarShortcut></MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Gardens</MenubarTrigger>
                <MenubarContent>
                    <MenubarRadioGroup value={root}>
                        {workspaces.map(w =>
                            <MenubarRadioItem key={w} value={w} onSelect={() => {
                                if (root != w) addWorkspace(w)
                            }}>{w.split(sep()).pop()}</MenubarRadioItem>
                        )}
                    </MenubarRadioGroup>
                    <MenubarSeparator />
                    <MenubarItem inset onSelect={() => setShowManager(true)}>Manage Gardens</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    )
}
