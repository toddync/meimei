import { create } from "zustand"
import { persist } from "zustand/middleware"

export type EditorTab = {
    path: string
    name: string
    extension: string
    directory: string
}

export type Tab = {
    value: string
    type: "editor" | ""
    data: EditorTab
}

interface TabState {
    tabs: Tab[]
    add: (tab: Tab) => void
    remove: (index: number) => void

    value: string
    selectedIndex: number
    select: (value: string) => void

    history: string[]
}

export const useTabStore = create<TabState>()(
    persist(
        (set, get) => ({
            tabs: [],
            value: "",
            selectedIndex: 0,
            history: [],

            add: (tab: Tab) => set((state) => {
                if (state.tabs.find((t) => t.value === tab.value)) {
                    return {
                        value: tab.value,
                        selectedIndex: state.tabs.findIndex((t) => t.value === tab.value),
                        history: [tab.value, ...state.history.filter((v) => v !== tab.value)],
                    }
                }
                return {
                    tabs: [...state.tabs, tab],
                    value: tab.value,
                    selectedIndex: state.tabs.length,
                    history: [tab.value, ...state.history],
                }
            }),

            remove: (index: number) => {
                const { tabs, value, history } = get()
                const removedTab = tabs[index]
                const newTabs = tabs.filter((_, i) => i !== index)
                const newHistory = history.filter((v) => v !== removedTab.value)

                let newValue = value
                let newSelectedIndex = get().selectedIndex

                if (removedTab.value === value) {
                    newValue = newHistory[0] || ""
                    newSelectedIndex = newTabs.findIndex((t) => t.value === newValue)
                }

                set({
                    tabs: newTabs,
                    value: newValue,
                    selectedIndex: newSelectedIndex,
                    history: newHistory
                })
            },

            select: (value: string) => {
                const { tabs, history } = get()
                const selectedIndex = tabs.findIndex((t) => t.value === value)
                if (selectedIndex >= 0) {
                    set({
                        value,
                        selectedIndex,
                        history: [value, ...history.filter((v) => v !== value)]
                    })
                }
            },
        }),
        {
            name: "tab-store",
            partialize: (state) => ({ ...state }),
        }
    )
)
