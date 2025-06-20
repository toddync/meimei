//@ts-nocheck
import * as path from '@tauri-apps/api/path'
import { lstat, mkdir, remove, rename, writeTextFile } from '@tauri-apps/plugin-fs'
import { create } from 'zustand'
import loadFilesFromDisk, { TreeData } from './loadFiles'
import { useMeimeiStore } from './meimeiStore'

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

    setFiles: (files: { tree: File[]; raw: File[] }) => void;
    addFile: (path: string, isDir?: boolean) => Promise<void>;
    renameFile: (oldPath: string, newPath: string) => Promise<void>;
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

    setFiles: (files) => set({ files }),

    addFile: async (newFilePath: string, isDir: boolean = false) => {
        if (isDir) {
            await mkdir(newFilePath, { recursive: true });
        } else {
            await writeTextFile(newFilePath, '');
        }
        await get().hydrate(useMeimeiStore.getState().workRoot);
    },

    renameFile: async (oldPath: string, newPath: string) => {
        await rename(oldPath, newPath);
        await get().hydrate(useMeimeiStore.getState().workRoot);
    },

    removeFile: async (targetPath: string) => {
        const stats = await lstat(targetPath);
        if (stats.isDirectory()) {
            await remove(targetPath, { recursive: true, force: true });
        }
        await get().hydrate(useMeimeiStore.getState().workRoot);
    },

    reparentFile: async (oldPath: string, newParentDir: string) => {
        const name = path.basename(oldPath);
        const newPath = path.join(newParentDir, name);
        await get().renameFile(oldPath, newPath);
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
