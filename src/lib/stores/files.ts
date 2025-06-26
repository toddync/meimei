//@ts-nocheck
import * as path from '@tauri-apps/api/path'
import { exists, lstat, mkdir, remove, rename, writeTextFile } from '@tauri-apps/plugin-fs'
import { create } from 'zustand'
import loadFilesFromDisk, { TreeData } from './loadFiles'
import { useMeimeiStore } from './meimei'
import { useTabStore } from './tabs'
import { toast } from 'sonner'

export interface File {
    dir: boolean
    path: string
    name: string
    filename: string
    directory: string
    extension: string
    isSelectable: boolean
}

export interface FileNode {
    path: string
    children?: FileNode[]
}

export interface Selection {
    from: number,
    to: number
}

interface FilesStore {
    files: TreeData;
    selected?: string;
    expanded: Record<string, boolean>;
    selection: Record<string, Selection>;

    dialogOpen: boolean
    dialogContext: any
    setDialogOpen: (v: boolean) => void
    setDialogContext: (v: any) => void

    setFiles: (files: { tree: File[]; raw: File[] }) => void;
    addFile: (path: string, isDir?: boolean) => Promise<void>;
    renameFile: (oldPath: string, newPath: string) => Promise<boolean>;
    removeFile: (path: string) => Promise<void>;
    reparentFile: (oldPath: string, newParentDir: string) => Promise<void>;
    setSelected: (path: string) => void;
    isExpanded: (path: string) => boolean;
    toggleExpanded: (path: string) => void;
    setExpanded: (paths: string[]) => void;
    getSelection: (path: string) => Selection,
    setSelection: (path: string, s: Selection) => void,

    hydrate: (base: string) => Promise<void>;
    persist: () => Promise<void>;
}

export const useFilesStore = create<FilesStore>((set, get) => ({
    files: {},
    selected: undefined,
    expanded: {},
    selection: {},

    dialogOpen: false,
    dialogContext: {},
    setDialogOpen: (dialogOpen) => set({ dialogOpen }),
    setDialogContext: (dialogContext) => set({ dialogContext }),

    setFiles: (files) => set({ files }),
    renameFile: async (oldPath: string, newPath: string, value?: string) => {
        if (await exists(newPath)) return (toast.error("Duplicate name", { description: "A file with the same name already exists on this folder" }), false)
        await rename(oldPath, newPath);

        if (value) {
            let { data } = useTabStore.getState().get(value)
            useTabStore.getState().update(value, { ...data, path: newPath, name: (await path.basename(newPath)).replace(".md", "") })
        }

        await get().hydrate(useMeimeiStore.getState().workRoot);
        return true
    },

    addFile: async (newFilePath: string, isDir: boolean = false) => {
        try {
            const fileExists = await exists(newFilePath);
            if (fileExists) {
                toast.error("File already exists", { description: newFilePath });
                return;
            }

            if (isDir) {
                await mkdir(newFilePath, { recursive: true });
            } else {
                await writeTextFile(newFilePath, '');
            }

            await get().hydrate(useMeimeiStore.getState().workRoot);
            toast.success("File added", { description: newFilePath });
        } catch (err) {
            console.error(err);
            toast.error("Failed to add file", { description: String(err) });
        }
    },

    removeFile: async (targetPath: string) => {
        try {
            const stats = await lstat(targetPath);
            await remove(targetPath, {
                recursive: stats.isDirectory,
                force: true
            });

            useTabStore.getState().removeByPath(targetPath)

            await get().hydrate(useMeimeiStore.getState().workRoot);
            toast.success("File removed");
        } catch (err) {
            console.error(err);
            toast.error("Failed to remove file", { description: String(err) });
        }
    },

    reparentFile: async (oldPath: string, newParentDir: string) => {
        try {
            const name = await path.basename(oldPath);
            const newPath = await path.join(newParentDir, name);

            if (oldPath == newPath) return;

            const success = await get().renameFile(oldPath, newPath);
            if (!success) throw new Error()

            let tab = useTabStore.getState().getByPath(oldPath)
            if (tab) {
                useTabStore.getState().update(tab.value, { ...tab.data, path: newPath, directory: newParentDir, name: (await path.basename(newPath)).replace(".md", "") })
            }

            toast.success("File moved")
            await get().hydrate(useMeimeiStore.getState().workRoot)
            if (get().selected == oldPath) set({ selected: newPath })

        } catch (err) {
            console.error(err);
            toast.error("Failed to move file", { description: String(err) });
        }
    },

    setSelected: (path) => {
        get().persist()
        set({ selected: path })
    },

    isExpanded: (path) => {
        return get().expanded[path] || false;
    },

    setExpanded: (paths: string[]) => {
        let map = {}

        paths.map(path => map[path] = true)
        set({ expanded: map });
        get().persist()
    },

    toggleExpanded: (path) => {
        const map = { ...get().expanded };
        map[path] = !map[path];
        set({ expanded: map });
        get().persist()
    },

    reconcileExpanded: (availablePaths) => {
        const validPaths = new Set(availablePaths)
        const reconciled = Object.fromEntries(
            Object.entries(get().expanded).filter(([path]) => validPaths.has(path))
        )
        set({ expanded: reconciled })
        get().persist()
    },

    getSelection: (path) => {
        return get().selection[path] || { from: 1, to: 1 };
    },
    setSelection: (path, s) => {
        const selection = { ...get().selection };
        selection[path] = s;
        set({ selection });
        get().persist()
    },

    hydrate: async (base) => {
        let store = useMeimeiStore.getState().workspaceStore;
        const saved = await store?.get("fileStore");
        if (saved && typeof saved === "object") {
            const state = saved as Partial<FilesStore>;
            if (state.selected) set({ selected: state.selected });
            if (state.expanded) set({ expanded: state.expanded });
            if (state.selection) set({ selection: state.selection });
        }

        const files = await loadFilesFromDisk(base)
        let availablePaths = []
        Object.keys(files.items).map(k => availablePaths.push(files.items[k].data?.path))

        set({ files })
        get().reconcileExpanded(availablePaths)
    },

    persist: async () => {
        const { files, selected, expanded, selection } = get();
        let store = useMeimeiStore.getState().workspaceStore;
        await store?.set("fileStore", { selected, expanded, selection });
        await store?.save();
    }
}));
