import { create } from "zustand"
import { useMeimeiStore } from "./meimei"

export type EditorTab = {
    path: string
    name: string
    extension: string
    directory: string
}

export type Tab = {
    value: string
    type: "editor" | "image"
}

interface TabStore {
    tabs: Tab[]
    TabDataMap: Record<string, EditorTab>
    add: (tab: Tab, data: EditorTab) => void
    update: (value: string, data: EditorTab) => void

    get: (value: string) => Tab
    getData: (k: string) => EditorTab
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

        TabDataMap: {},
        getData: (k) => get().TabDataMap[k],

        add: (tab: Tab, data: EditorTab) => {
            let state = get();
            let t_ = state.tabs.find(t => state.TabDataMap[t.value].path == data.path)
            if (t_) {
                return set({
                    value: t_.value,
                    selectedIndex: state.tabs.findIndex((t) => t.value === t_.value),
                    history: [t_.value, ...state.history.filter((v) => v !== t_.value)],
                })
            }

            set({
                tabs: [...state.tabs, tab],
                TabDataMap: { ...state.TabDataMap, [tab.value]: data },
                value: tab.value,
                selectedIndex: state.tabs.length,
                history: [tab.value, ...state.history],
            })

            state.persist()
        },

        remove: (index: number) => {
            const { tabs, value, history, TabDataMap } = get()
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

            delete TabDataMap[value]

            set({
                tabs: newTabs,
                value: newValue,
                selectedIndex: newSelectedIndex,
                history: newHistory,
                TabDataMap
            })

            get().persist()
        },

        update: (value: string, data: EditorTab) => {
            let { TabDataMap } = get()
            set({ TabDataMap: { ...TabDataMap, [value]: data } })
            get().persist()
        },

        get: (value: string) => {
            let { tabs } = get()
            let i = tabs.findIndex(t => t.value == value);
            return tabs[i]
        },

        getByPath: (path: string) => {
            let { tabs, TabDataMap } = get()
            let i = tabs.findIndex(t => TabDataMap[t.value].path == path);
            return i >= 0 ? tabs[i] : undefined
        },

        removeByPath: (path: string) => {
            const { tabs, remove, TabDataMap } = get();
            const index = tabs.findIndex(t => TabDataMap[t.value].path == path);
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
                if (state.TabDataMap) set({ TabDataMap: state.TabDataMap });
                if (state.selectedIndex) set({ selectedIndex: state.selectedIndex });
            }
        },

        persist: async () => {
            let store = useMeimeiStore.getState().workspaceStore;
            const { history, selectedIndex, tabs, value, TabDataMap } = get();
            await store?.set("tabStore", { history, tabs, value, selectedIndex, TabDataMap });
            await store?.save();
        }
    })
)
