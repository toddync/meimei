import { invoke } from "@tauri-apps/api/core";
import { getAllWebviewWindows, getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Store } from "@tauri-apps/plugin-store";
import { create } from "zustand";

interface MeimeiStore {
    appStore?: Store,
    workspaceStore?: Store,

    toggleSidebar: () => void;
    setToggleSidebar: (fn: () => void) => void;

    showManager: boolean,
    setShowManager: (v: boolean) => void,

    workRoot: string,
    focus?: () => void,
    workspaces: string[],
    activeWorkspaces: string[],

    addWorkspace: (path: string) => void,
    removeWorkspace: (path: string) => Promise<void>,
    deactivateWorkspace: (path: string) => Promise<void>,

    setFocus: (fn?: () => void) => void,
    setWorkRoot: (root: string) => void,
    setAppStore: (appStore: Store) => void
    setWorkspaceStore: (workspaceStore: Store) => void,

    persist: () => Promise<void>,
    hydrate: () => Promise<void>
}

export const useMeimeiStore = create<MeimeiStore>((set, get) => ({
    appStore: undefined,
    workspaceStore: undefined,


    workRoot: "",
    workspaces: [],
    activeWorkspaces: [],
    focus: undefined,

    showManager: false,
    setShowManager: (showManager) => set({ showManager }),


    toggleSidebar: () => { },
    setToggleSidebar: (toggleSidebar) => set({ toggleSidebar }),

    addWorkspace: (path: string) => {
        if (!path) return;
        let { workspaces, activeWorkspaces, workRoot } = get();
        if (!workspaces.includes(path)) workspaces.push(path)
        if (!activeWorkspaces.includes(path)) activeWorkspaces.push(path)

        set({ workspaces, activeWorkspaces })
        get().persist()

        if (!workRoot) set({ workRoot: path })
        else invoke("open_window", { label: encodeFilePath(path) })
    },

    removeWorkspace: async (path: string) => {
        let { workspaces, activeWorkspaces, workRoot } = get();
        workspaces = workspaces.filter(w => w != path)
        activeWorkspaces = activeWorkspaces.filter(w => w != path)
        set({ workspaces, activeWorkspaces })

        get().persist()

        if (path == workRoot) {
            getCurrentWebviewWindow().close()
        } else {
            (await getAllWebviewWindows()).forEach(window => {
                if (window.label == encodeFilePath(path))
                    window.close()
            })
        }

    },

    deactivateWorkspace: async (path: string) => {
        let { activeWorkspaces, workRoot } = get();

        if (activeWorkspaces.length > 1) {
            activeWorkspaces = activeWorkspaces.filter(w => w != path)
            set({ activeWorkspaces })
        }

        await get().persist()

        if (path == workRoot) {
            getCurrentWebviewWindow().close()
        } else {
            (await getAllWebviewWindows()).forEach(window => {
                if (window.label == encodeFilePath(path))
                    window.close()
            })
        }
    },

    setFocus: (focus) => set({ focus }),
    setWorkRoot: (workRoot) => set({ workRoot }),
    setAppStore: (appStore: Store) => set({ appStore }),
    setWorkspaceStore: (workspaceStore: Store) => set({ workspaceStore }),

    persist: async () => {
        let { workspaces, activeWorkspaces, appStore } = get()
        await appStore?.set("workspaces", workspaces)
        await appStore?.set("activeWorkspaces", activeWorkspaces)
        await appStore?.save();
    },

    hydrate: async () => {
        let store = get().appStore;
        const workspaces = await store?.get("workspaces") as string[];
        const activeWorkspaces = await store?.get("activeWorkspaces") as string[];

        if (workspaces) set({ workspaces });
        if (activeWorkspaces) set({ activeWorkspaces });

        await store?.reload()
        set({ appStore: store })
    }
}))

export function encodeFilePath(path: string) {
    return path.replace(
        /[^a-zA-Z0-9-/:_]/g,
        (c) => `_${c.charCodeAt(0).toString(16).toUpperCase()}`
    );
}

export function decodeFilePath(label: string) {
    return label.replace(/_([0-9A-F]{2})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
    );
}