import * as path from '@tauri-apps/api/path'
import { exists, lstat, mkdir, remove, rename, writeTextFile } from '@tauri-apps/plugin-fs'
import { toast } from 'sonner'
import { create } from 'zustand'
import loadFilesFromDisk, { TreeData } from '../scripts/load-files'
import { useMeimeiStore } from './meimei'
import { useTabStore } from './tabs'

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
    from: number
    to: number
}

interface FilesStore {
    files: TreeData
    selected?: string
    expanded: Record<string, boolean>
    selection: Record<string, Selection>

    dialogOpen: boolean
    dialogContext: any
    setDialogOpen: (v: boolean) => void
    setDialogContext: (v: any) => void

    setFiles: (files: TreeData) => void
    addFile: (path: string, isDir?: boolean) => Promise<void>
    renameFile: (oldPath: string, newPath: string) => Promise<boolean>
    removeFile: (path: string) => Promise<void>
    reparentFile: (oldPath: string, newParentDir: string) => Promise<void>
    setSelected: (path: string) => void
    isExpanded: (path: string) => boolean
    toggleExpanded: (path: string) => void
    setExpanded: (paths: string[]) => void
    getSelection: (path: string) => Selection
    setSelection: (path: string, s: Selection) => void

    hydrate: (base: string) => Promise<void>
    persist: () => Promise<void>,
    reconcileExpanded: (availablePaths: string[]) => void
}

export const useFilesStore = create<FilesStore>((set, get) => ({
    files: {} as TreeData,
    selected: undefined,
    expanded: {},
    selection: {},

    dialogOpen: false,
    dialogContext: {},
    setDialogOpen: (dialogOpen) => set({ dialogOpen }),
    setDialogContext: (dialogContext) => set({ dialogContext }),

    setFiles: (files) => set({ files }),

    renameFile: async (oldPath: string, newPath: string) => {
        if (await exists(newPath)) {
            toast.error("Duplicate name", { description: "A file with the same name already exists in this folder" })
            return false
        }

        // Perform file system rename
        await rename(oldPath, newPath)

        // Update open tabs: single file or child files in a directory
        const tabStore = useTabStore.getState()
        const allTabs = Object.values(tabStore.tabs)
        for (let i = 0; i < allTabs.length; i++) {
            let tab = allTabs[i]
            let tabData = tabStore.getData(tab.value)
            if (tabData.path === oldPath || tabData.path.startsWith(oldPath + path.sep())) {
                const relative = tabData.path.substring(oldPath.length)
                const updatedPath = newPath + relative
                const newName = (await path.basename(updatedPath)).replace(".md", "")
                tabStore.update(tab.value, { ...tabData, path: updatedPath, name: newName })
            }
        }

        // Preserve expanded and selection states for directory
        const { expanded, selection } = get()
        Object.keys(expanded).forEach(p => {
            if (p === oldPath || p.startsWith(oldPath + path.sep())) {
                const newKey = p.replace(oldPath, newPath)
                set({ expanded: { ...get().expanded, [newKey]: expanded[p] } })
            }
        })
        Object.keys(selection).forEach(p => {
            if (p === oldPath || p.startsWith(oldPath + path.sep())) {
                const newKey = p.replace(oldPath, newPath)
                set({ selection: { ...get().selection, [newKey]: selection[p] } })
            }
        })

        // Update selected
        if (get().selected && (get().selected === oldPath || get().selected?.startsWith(oldPath + path.sep()))) {
            set({ selected: get().selected?.replace(oldPath, newPath) })
        }

        get().persist()
        await get().hydrate(useMeimeiStore.getState().workRoot)
        return true
    },

    addFile: async (newFilePath: string, isDir: boolean = false) => {
        try {
            if (await exists(newFilePath)) {
                toast.error("File already exists", { description: newFilePath })
                return
            }
            if (isDir) {
                await mkdir(newFilePath, { recursive: true })
            } else {
                await writeTextFile(newFilePath, "")
            }
            await get().hydrate(useMeimeiStore.getState().workRoot)
            toast.success(isDir ? "Folder added" : "File added")
        } catch (err) {
            console.error(err)
            toast.error("Failed to add file", { description: String(err) })
        }
    },

    removeFile: async (targetPath: string) => {
        try {
            const stats = await lstat(targetPath)
            await remove(targetPath, { recursive: stats.isDirectory })

            // Close any tabs for this file or its children if directory
            const tabStore = useTabStore.getState()
            Object.values(tabStore.tabs).forEach(tab => {
                let tabData = tabStore.getData(tab.value)
                if (tabData.path === targetPath || tabData.path.startsWith(targetPath)) {
                    tabStore.removeByPath(tabData.path)
                }
            })

            get().persist()
            await get().hydrate(useMeimeiStore.getState().workRoot)
            toast.success("File removed")
        } catch (err) {
            console.error(err)
            toast.error("Failed to remove file", { description: String(err) })
        }
    },

    reparentFile: async (oldPath: string, newParentDir: string) => {
        try {
            const name = await path.basename(oldPath)
            const newPath = await path.join(newParentDir, name)
            if (oldPath === newPath) return
            const success = await get().renameFile(oldPath, newPath)
            if (!success) throw new Error()
            toast.success("File moved")
        } catch (err) {
            console.error(err)
            toast.error("Failed to move file", { description: String(err) })
        }
    },

    setSelected: (path) => {
        set({ selected: path })
        get().persist()
    },

    isExpanded: (path) => get().expanded[path] || false,

    setExpanded: (paths: string[]) => {
        const map: Record<string, boolean> = {}
        paths.forEach(p => map[p] = true)
        set({ expanded: map })
        get().persist()
    },

    toggleExpanded: (path) => {
        const map = { ...get().expanded }
        map[path] = !map[path]
        set({ expanded: map })
        get().persist()
    },

    getSelection: (path) => get().selection[path] || { from: 1, to: 1 },
    setSelection: (path, s) => {
        const sel = get().selection
        sel[path] = s
        set({ selection: sel })
        get().persist()
    },

    hydrate: async (base) => {
        const store = useMeimeiStore.getState().workspaceStore
        const saved = await store?.get("fileStore")
        if (saved && typeof saved === "object") {
            const state = saved as Partial<FilesStore>
            if (state.selected) set({ selected: state.selected })
            if (state.expanded) set({ expanded: state.expanded })
            if (state.selection) set({ selection: state.selection })
        }
        const files = await loadFilesFromDisk(base)
        let availablePaths: string[] = []
        Object.keys(files.items).map(k => availablePaths.push(files.items[k].data?.path))
        set({ files })
        get().reconcileExpanded(availablePaths)
    },

    persist: async () => {
        const { selected, expanded, selection } = get()
        const store = useMeimeiStore.getState().workspaceStore
        await store?.set("fileStore", { selected, expanded, selection })
        await store?.save()
    },

    reconcileExpanded: (availablePaths) => {
        const validPaths = new Set(availablePaths)
        const reconciled = Object.fromEntries(
            Object.entries(get().expanded).filter(([path]) => validPaths.has(path))
        )
        set({ expanded: reconciled })
        get().persist()
    },
}))
