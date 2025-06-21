import { create } from "zustand"
import { useMeimeiStore } from "./meimeiStore"

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
    update: (value: string, data: EditorTab) => void

    get: (value: string) => Tab
    getByPath: (path: string) => Tab | undefined

    remove: (index: number) => void
    removeByPath: (path: string) => void

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
            let t_ = state.tabs.find((t) => t.data.path === tab.data.path)
            if (t_) {
                return set({
                    value: t_.value,
                    selectedIndex: state.tabs.findIndex((t) => t.value === t_.value),
                    history: [t_.value, ...state.history.filter((v) => v !== t_.value)],
                })
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
            }
            newSelectedIndex = newTabs.findIndex((t) => t.value === newValue)

            set({
                tabs: newTabs,
                value: newValue,
                selectedIndex: newSelectedIndex,
                history: newHistory
            })

            get().persist()
        },

        update: (value: string, data: EditorTab) => {
            let { tabs } = get()
            let i = tabs.findIndex(t => t.value == value);

            if (i >= 0) {
                tabs[i].data = data;
                set({ tabs: [...tabs] })
            }
        },

        get: (value: string) => {
            let { tabs } = get()
            let i = tabs.findIndex(t => t.value == value);
            return tabs[i]
        },

        getByPath: (path: string) => {
            let { tabs } = get()
            let i = tabs.findIndex(t => t.data.path == path);
            return i >= 0 ? tabs[i] : undefined
        },

        removeByPath: (path: string) => {
            const { tabs, remove } = get();
            const index = tabs.findIndex(t => t.data.path === path);
            if (index !== -1) {
                remove(index);
            }
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
            let store = useMeimeiStore.getState().workspaceStore;
            const saved = await store?.get("tabStore");
            if (saved && typeof saved === "object") {
                const state = saved as Partial<TabStore>;
                if (state.tabs) set({ tabs: state.tabs });
                if (state.value) set({ value: state.value });
                if (state.history) set({ history: state.history });
                if (state.selectedIndex) set({ selectedIndex: state.selectedIndex });
            }
        },

        persist: async () => {
            let store = useMeimeiStore.getState().workspaceStore;
            const { history, selectedIndex, tabs, value } = get();
            await store?.set("tabStore", { history, tabs, value, selectedIndex });
            await store?.save();
        }
    })
)
