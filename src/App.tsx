//@ts-nocheck
import Sidebar from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar";
import { flowerLotus } from "@lucide/lab";
import { Window } from "@tauri-apps/api/window";
import { Icon } from "lucide-react";
import { useEffect } from "react";
import Commands from "./lib/components/Commands";
import DotsMenu from "./lib/components/dots-menu";
import PageResolver from "./lib/components/page-resolver";
import { useFilesStore } from "./lib/stores/Files";
import { loadFilesFromDisk } from "./lib/stores/loadFiles";
import { useWindowStore } from "./lib/stores/window";

export default function Page() {
  let window: Window = useWindowStore(s => s.window)
  let setFiles = useFilesStore(s => s.setFiles)
  const defaultOpen = localStorage.getItem("sidebar:open") === "true"

  useEffect(() => {
    (async () => {
      loadAndReconcile("/home/danny/vaults/D&D/")
      // let files = await loadFiles("/home/danny/vaults/D&D/");
      // setFiles(files)
    })()
  })


  return (
    <>
      <Commands />

      <div className="h-8 bg-accent border-b flex">
        <div className="w-12 flex">
          <div className="mx-auto text-sidebar-primary flex aspect-square size-8 items-center justify-center">
            <Icon iconNode={flowerLotus} className="size-5 stroke-2" />
          </div>
        </div>
        <DotsMenu />
      </div>

      <main className="overflow-hidden h-[calc(100svh_-_32px)] page-h">
        <SidebarProvider
          defaultOpen={defaultOpen}
          style={
            {
              "--sidebar-width": "400px",
            } as React.CSSProperties
          }
        >
          <Sidebar />
          <SidebarInset className="overflow-hidden page-h">
            <PageResolver />
          </SidebarInset>
        </SidebarProvider>
      </main>
    </>
  )
}

export async function loadAndReconcile(base: string) {
  const files = await loadFilesFromDisk(base)
  const availablePaths = files.raw.map(f => f.path)
  const store = useFilesStore.getState()
  store.setFiles(files)
  store.reconcileExpanded(availablePaths)
}