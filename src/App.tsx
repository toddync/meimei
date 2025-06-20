import { invoke } from '@tauri-apps/api/core';
import * as path from '@tauri-apps/api/path';
import { configDir } from "@tauri-apps/api/path";
import { getCurrentWebview } from '@tauri-apps/api/webview';
import { getAllWebviewWindows } from '@tauri-apps/api/webviewWindow';
import { exists, mkdir } from '@tauri-apps/plugin-fs';
import { load } from '@tauri-apps/plugin-store';
import { useEffect, useState } from "react";
import WorkspaceManager from './lib/components/workspace-manager';
import WorkspaceDialog from './lib/components/workspaceDialog';
import { decodeFilePath, encodeFilePath, useMeimeiStore } from './lib/stores/meimeiStore';
import Workspace from './Workspace';

export default function Page() {
  const [loaded, setLoaded] = useState<boolean>(false)

  const root = useMeimeiStore(s => s.workRoot)
  const setRoot = useMeimeiStore(s => s.setWorkRoot)

  const setAppStore = useMeimeiStore(s => s.setAppStore)
  const hydrateMeimei = useMeimeiStore(s => s.hydrate)

  useEffect(() => {
    (async () => {
      let config = await path.join(await configDir(), "meimei")
      let storePath = await path.join(config, "store.json");
      const label = getCurrentWebview().label;

      if (!(await exists(config)))
        await mkdir(config);
      let store = await load(storePath, { autoSave: true })
      setAppStore(store)

      setInterval(() => hydrateMeimei(), 500)

      if (label == "main") {
        let aw = await store.get("activeWorkspaces") as string[];
        let w = await store.get("workspaces") as string[];

        if (aw.length > 0) {
          setRoot(aw[0])
          let windowList = await getAllWebviewWindows();
          for (let i = 1; i < aw.length; i++) {
            if (windowList.findIndex(window => window.label == aw[i]) == -1) {
              await invoke("open_window", { label: encodeFilePath(aw[i]) })
            }
          }
        } else {
          if (w.length > 0) {
            setRoot(w[0])
          }
        }
      } else setRoot(decodeFilePath(label))

      await hydrateMeimei()
      setLoaded(true)
    })()
  }, [])

  return (loaded && <>
    <WorkspaceDialog />
    <WorkspaceManager />
    {root && <Workspace root={root} />}
  </>
  )
}