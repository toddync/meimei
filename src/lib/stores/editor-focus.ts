import { create } from "zustand"

interface EditorFocusStore {
    focus?: () => void,
    setFocus: (fn: (() => void) | undefined) => void
}

export const useEditorFocusStore = create<EditorFocusStore>((set) => ({
    focus: undefined,
    setFocus: (fn) => set({ focus: fn })
}))