//@ts-nocheck
import Sidebar from "@/components/app-sidebar";
import {
    SidebarInset,
    SidebarProvider
} from "@/components/ui/sidebar";
import { Window } from "@tauri-apps/api/window";
import { exists, mkdir } from '@tauri-apps/plugin-fs';
import { load } from '@tauri-apps/plugin-store';
import { useEffect, useState } from "react";
import Commands from "./lib/components/Commands";
import Loader from "./lib/components/loader";
import PageResolver from "./lib/components/page-resolver";
import { useFilesStore } from "./lib/stores/Files";
import { useTabStore } from "./lib/stores/tab-store";
import { useWindowStore } from "./lib/stores/window";
import { useMeimeiStore } from "./lib/stores/meimeiStore";

export default function Workspace({ root }: { root?: string }) {
    let window: Window = useWindowStore(s => s.window)
    let setFiles = useFilesStore(s => s.setFiles)
    const defaultOpen = localStorage.getItem("sidebar:open") === "true"

    const setWorkspaceStore = useMeimeiStore(s => s.setWorkspaceStore)

    let hydrateFiles = useFilesStore(s => s.hydrate)
    let hydrateTabs = useTabStore(s => s.hydrate)

    const [loaded, setLoaded] = useState<boolean>(false)

    useEffect(() => {
        (async () => {
            if (root) {
                if (!(await exists(`${root}/.meimei`))) await mkdir(`${root}/.meimei`);
                setWorkspaceStore(
                    await load(root + "/.meimei/store.json", {
                        autoSave: true
                    })
                )

                await hydrateFiles(root)
                await hydrateTabs()
            }

            setLoaded(true)
        })()
    })


    return (
        <main className="overflow-clip h-svh page-h flex flex-col">
            {loaded ?
                <SidebarProvider
                    defaultOpen={defaultOpen}
                    style={
                        {
                            "--sidebar-width": "400px",
                        } as React.CSSProperties
                    }
                >
                    <Commands />
                    <Sidebar />
                    <SidebarInset className="overflow-hidden page-h">
                        <PageResolver />
                    </SidebarInset>
                </SidebarProvider>
                : <Loader />
            }
        </main>
    )
}