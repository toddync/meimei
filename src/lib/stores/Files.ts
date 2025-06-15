// useFilesStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

interface FilesState {
    files: { tree: FileNode[], raw: File[] }
    expanded: Record<string, boolean>
    selected?: string // path

    setFiles: (files: { tree: FileNode[], raw: File[] }) => void
    toggleExpanded: (path: string) => void
    isExpanded: (path: string) => boolean
    setSelected: (path: string) => void
    reconcileExpanded: (availablePaths: string[]) => void
}

export const useFilesStore = create<FilesState>()(
    persist(
        (set, get) => ({
            files: { tree: [], raw: [] },
            expanded: {},
            selected: undefined,

            setFiles: (files) => set({ files }),

            toggleExpanded: (path) => {
                const current = get().expanded[path] ?? false
                set(state => ({
                    expanded: {
                        ...state.expanded,
                        [path]: !current
                    }
                }))
            },

            isExpanded: (path) => {
                return get().expanded[path] ?? false
            },

            setSelected: (path) => {
                set({ selected: path })
            },

            reconcileExpanded: (availablePaths) => {
                const validPaths = new Set(availablePaths)
                const reconciled = Object.fromEntries(
                    Object.entries(get().expanded).filter(([path]) => validPaths.has(path))
                )
                set({ expanded: reconciled })
            }
        }),
        {
            name: 'file-ui-state',
            partialize: (state) => ({
                expanded: state.expanded,
                selected: state.selected
            })
        }
    )
)

// You can now call `loadAndReconcile("/some/path")` on app start.
// And mount `usePersistedFilesStoreEffects()` in your root layout/component.
