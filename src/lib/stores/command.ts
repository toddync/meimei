import { create } from 'zustand';

interface FileStore {
    open: boolean,
    setOpen: (_: boolean) => void
    toggle: () => void
}

export const useCommandStore = create<FileStore>((set) => ({
    open: false,
    setOpen: (open: boolean) => set({ open }),
    toggle: () => set(({ open }) => ({ open: !open }))
}))