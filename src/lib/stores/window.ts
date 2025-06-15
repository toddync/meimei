
import { getCurrentWindow, type Window } from "@tauri-apps/api/window";
import { create } from 'zustand'

export const useWindowStore = create((set) => ({
    window: getCurrentWindow(),
    setWindow: (window: Window) => set({ window }),
}))