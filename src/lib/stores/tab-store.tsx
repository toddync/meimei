import { create } from "zustand"

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

interface TabStore {
    tabs: Tab[]
    add: (tab: Tab) => void
    remove: (index: number) => void

    value: string
    selectedIndex: number
    select: (value: string) => void

    history: string[]

    persist: () => Promise<void>,
    hydrate: () => Promise<void>
}

export const useTabStore = create<TabStore>()(
    (set, get) => ({
        tabs: [],
        value: "",
        selectedIndex: 0,
        history: [],

        add: (tab: Tab) => {
            let state = get();
            if (state.tabs.find((t) => t.value === tab.value)) {
                return {
                    value: tab.value,
                    selectedIndex: state.tabs.findIndex((t) => t.value === tab.value),
                    history: [tab.value, ...state.history.filter((v) => v !== tab.value)],
                }
            }

            set({
                tabs: [...state.tabs, tab],
                value: tab.value,
                selectedIndex: state.tabs.length,
                history: [tab.value, ...state.history],
            })

            state.persist()
        }
        ,

        remove: (index: number) => {
            const { tabs, value, history } = get()
            const removedTab = tabs[index]
            if (!removedTab) return;

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

            get().persist()
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

            get().persist()
        },

        hydrate: async () => {
            //@ts-ignore
            const saved = await globalThis.store?.get("tabStore");
            if (saved && typeof saved === "object") {
                const state = saved as Partial<TabStore>;
                if (state.tabs) set({ tabs: state.tabs });
                if (state.value) set({ value: state.value });
                if (state.history) set({ history: state.history });
                if (state.selectedIndex) set({ selectedIndex: state.selectedIndex });
            }
        },

        persist: async () => {
            const { history, selectedIndex, tabs, value } = get();
            //@ts-ignore
            await globalThis.store?.set("tabStore", { history, tabs, value, selectedIndex });
            //@ts-ignore
            await globalThis.store?.save();
        }
    })
)
