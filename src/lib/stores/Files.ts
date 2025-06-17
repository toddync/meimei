//@ts-nocheck
import { create } from 'zustand'
import { loadFilesFromDisk } from './loadFiles'

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
    files: {
        tree: File[];
        raw: File[];
    };
    selected?: string;
    expanded: Record<string, boolean>;
    selection: Record<string, Selection>;

    setFiles: (files: { tree: File[]; raw: File[] }) => void;
    setSelected: (path: string) => void;
    isExpanded: (path: string) => boolean;
    toggleExpanded: (path: string) => void;
    getSelection: (path: string) => Selection,
    setSelection: (path: string, s: Selection) => void,

    hydrate: (base: string) => Promise<void>;
    persist: () => Promise<void>;
}

export const useFilesStore = create<FilesStore>((set, get) => ({
    files: { tree: [], raw: [] },
    selected: undefined,
    expanded: {},
    selection: {},

    setFiles: (files) => set({ files }),

    setSelected: (path) => {
        get().persist()
        set({ selected: path })
    },

    isExpanded: (path) => {
        return get().expanded[path] || false;
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
        const saved = await globalThis.store?.get("fileStore");
        if (saved && typeof saved === "object") {
            const state = saved as Partial<FilesStore>;
            if (state.selected) set({ selected: state.selected });
            if (state.expanded) set({ expanded: state.expanded });
            if (state.selection) set({ selection: state.selection });
        }

        const files = await loadFilesFromDisk(base)
        const availablePaths = files.raw.map(f => f.path)
        set({ files })
        get().reconcileExpanded(availablePaths)
    },

    persist: async () => {
        const { files, selected, expanded, selection } = get();
        await globalThis.store?.set("fileStore", { selected, expanded, selection });
        await globalThis.store?.save();
    }
}));
