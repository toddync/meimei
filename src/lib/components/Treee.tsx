import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    ControlledTreeEnvironment,
    Tree,
    type TreeItem,
    type TreeItemIndex,
    type TreeRef,
    type TreeViewState,
} from "react-complex-tree";

const treeData: Record<TreeItemIndex, TreeItem<string>> = {
    root: {
        index: "root",
        isFolder: true,
        children: ["item1", "item9", "item32", "item35"],
        data: "root",
    },
    item1: {
        index: "item1",
        isFolder: true,
        children: ["item2", "item3", "item4", "item5", "item8"],
        data: "Fruit",
    },
    item2: {
        index: "item2",
        isFolder: false,
        data: "Apple",
    },
    item3: {
        index: "item3",
        isFolder: false,
        data: "Orange",
    },
    item4: {
        index: "item4",
        isFolder: false,
        data: "Lemon",
    },
    item5: {
        index: "item5",
        isFolder: true,
        children: ["item6", "item7"],
        data: "Berries",
    },
    item6: {
        index: "item6",
        isFolder: false,
        data: "Strawberry",
    },
    item7: {
        index: "item7",
        isFolder: false,
        data: "Blueberry",
    },
    item8: {
        index: "item8",
        isFolder: false,
        data: "Banana",
    },
    item9: {
        index: "item9",
        isFolder: true,
        children: ["item10", "item16", "item22", "item27"],
        data: "Meals",
    },
    item10: {
        index: "item10",
        isFolder: true,
        children: ["item11", "item12", "item13", "item14", "item15"],
        data: "America",
    },
    item11: {
        index: "item11",
        isFolder: false,
        data: "SmashBurger",
    },
    item12: {
        index: "item12",
        isFolder: false,
        data: "Chowder",
    },
    item13: {
        index: "item13",
        isFolder: false,
        data: "Ravioli",
    },
    item14: {
        index: "item14",
        isFolder: false,
        data: "MacAndCheese",
    },
    item15: {
        index: "item15",
        isFolder: false,
        data: "Brownies",
    },
    item16: {
        index: "item16",
        isFolder: true,
        children: ["item17", "item18", "item19", "item20", "item21"],
        data: "Europe",
    },
    item17: {
        index: "item17",
        isFolder: false,
        data: "Risotto",
    },
    item18: {
        index: "item18",
        isFolder: false,
        data: "Spaghetti",
    },
    item19: {
        index: "item19",
        isFolder: false,
        data: "Pizza",
    },
    item20: {
        index: "item20",
        isFolder: false,
        data: "Weisswurst",
    },
    item21: {
        index: "item21",
        isFolder: false,
        data: "Spargel",
    },
    item22: {
        index: "item22",
        isFolder: true,
        children: ["item23", "item24", "item25", "item26"],
        data: "Asia",
    },
    item23: {
        index: "item23",
        isFolder: false,
        data: "Curry",
    },
    item24: {
        index: "item24",
        isFolder: false,
        data: "PadThai",
    },
    item25: {
        index: "item25",
        isFolder: false,
        data: "Jiaozi",
    },
    item26: {
        index: "item26",
        isFolder: false,
        data: "Sushi",
    },
    item27: {
        index: "item27",
        isFolder: true,
        children: ["item28", "item29", "item30", "item31"],
        data: "Australia",
    },
    item28: {
        index: "item28",
        isFolder: false,
        data: "PotatoWedges",
    },
    item29: {
        index: "item29",
        isFolder: false,
        data: "PokeBowl",
    },
    item30: {
        index: "item30",
        isFolder: false,
        data: "Curd",
    },
    item31: {
        index: "item31",
        isFolder: false,
        data: "KumaraFries",
    },
    item32: {
        index: "item32",
        isFolder: true,
        children: ["item33", "item34"],
        data: "Desserts",
    },
    item33: {
        index: "item33",
        isFolder: false,
        data: "Cookies",
    },
    item34: {
        index: "item34",
        isFolder: false,
        data: "IceCream",
    },
    item35: {
        index: "item35",
        isFolder: true,
        children: ["item36", "item37", "item38"],
        data: "Drinks",
    },
    item36: {
        index: "item36",
        isFolder: false,
        data: "PinaColada",
    },
    item37: {
        index: "item37",
        isFolder: false,
        data: "Cola",
    },
    item38: {
        index: "item38",
        isFolder: false,
        data: "Juice",
    },
};

type DisposableType = {
    dispose: () => void;
};

type EventEmitterOptionsType<T> = {
    logger?: (log: string, payload?: T) => void;
};

type EventHandlerType<T> =
    | ((payload: T) => Promise<void> | void)
    | null
    | undefined;

type TreeDataProviderType<T> = {
    getTreeItem: (itemId: TreeItemIndex) => Promise<TreeItem<T>>;
    getTreeItems?: (itemIds: TreeItemIndex[]) => Promise<TreeItem<T>[]>;
    onRenameItem?: (item: TreeItem<T>, name: string) => Promise<void>;
    onDidChangeTreeData?: (
        listener: (changedItemIds: TreeItemIndex[]) => void,
    ) => DisposableType;
    onChangeItemChildren?: (
        itemId: TreeItemIndex,
        newChildren: TreeItemIndex[],
    ) => Promise<void>;
};

class EventEmitter<EventPayload> {
    private handlerCount = 0;

    private handlers: Array<EventHandlerType<EventPayload>> = [];

    private options?: EventEmitterOptionsType<EventPayload>;

    constructor(options?: EventEmitterOptionsType<EventPayload>) {
        this.options = options;
    }

    public get numberOfHandlers() {
        return this.handlers.filter((h) => !!h).length;
    }

    public async emit(payload: EventPayload): Promise<void> {
        const promises: Array<Promise<void>> = [];

        this.options?.logger?.("emit", payload);

        for (const handler of this.handlers) {
            if (handler) {
                const res = handler(payload) as Promise<void>;
                if (typeof res?.then === "function") {
                    promises.push(res);
                }
            }
        }

        await Promise.all(promises);
    }

    public on(handler: EventHandlerType<EventPayload>): number {
        this.options?.logger?.("on");
        this.handlers.push(handler);
        // eslint-disable-next-line no-plusplus
        return this.handlerCount++;
    }

    public off(handlerId: number) {
        this.delete(handlerId);
    }

    public delete(handlerId: number) {
        this.options?.logger?.("off");
        this.handlers[handlerId] = null;
    }
}

class TreeDataProvider<T> implements TreeDataProviderType<T> {
    private items: Record<TreeItemIndex, TreeItem<T>>;
    private setItemName?: (item: TreeItem<T>, newName: string) => TreeItem<T>;

    public readonly onDidChangeTreeDataEmitter = new EventEmitter<
        TreeItemIndex[]
    >();

    constructor(
        items: Record<TreeItemIndex, TreeItem<T>>,
        setItemName?: (item: TreeItem<T>, newName: string) => TreeItem<T>,
    ) {
        this.items = items;
        this.setItemName = setItemName;
    }

    public async getTreeItem(itemId: TreeItemIndex) {
        const item = this.items[itemId];
        if (!item) {
            return {
                index: itemId,
                isFolder: false,
                data: `Unknown Item: ${itemId}` as T,
            };
        }
        return item;
    }

    public async onChangeItemChildren(
        itemId: TreeItemIndex,
        newChildren: TreeItemIndex[],
    ) {
        if (this.items[itemId]) {
            this.items[itemId].children = newChildren;
            await this.onDidChangeTreeDataEmitter.emit([itemId]);
        }
    }

    public onDidChangeTreeData(
        listener: (changedItemIds: TreeItemIndex[]) => void,
    ) {
        const handlerId = this.onDidChangeTreeDataEmitter.on((payload) =>
            listener(payload),
        );
        return { dispose: () => this.onDidChangeTreeDataEmitter.off(handlerId) };
    }

    public async onRenameItem(item: TreeItem<T>, name: string) {
        if (this.setItemName) {
            this.items[item.index] = this.setItemName(item, name);
        }
    }
}

const viewStateInitial: TreeViewState = {
    "tree-sample": {},
};

const TreeView: React.FC = () => {
    const tree = useRef<TreeRef>(null);
    const [viewState, setViewState] = useState<TreeViewState>(viewStateInitial);
    const [search, setSearch] = useState<string | undefined>("");

    const dataProvider = useMemo(
        () => new TreeDataProvider<string>(treeData),
        [],
    );

    const getItemPath = useCallback(
        async (
            search: string,
            searchRoot: TreeItemIndex = "root",
        ): Promise<TreeItemIndex[] | null> => {
            const item = await dataProvider.getTreeItem(searchRoot);

            if (item.data.toLowerCase().includes(search.toLowerCase())) {
                return [item.index];
            }

            const searchedItems = await Promise.all(
                item.children?.map((child) => getItemPath(search, child)) ?? [],
            );

            const result = searchedItems.find((item) => item !== null);
            if (!result) {
                return null;
            }

            return [item.index, ...result];
        },
        [dataProvider],
    );

    const onSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (search) {
                getItemPath(search)
                    .then((path) => {
                        if (path) {
                            return tree.current?.expandSubsequently(path).then(() => {
                                tree.current?.selectItems([...[path.at(-1) ?? ""]]);
                                tree.current?.focusItem(path.at(-1) ?? "");
                                tree.current?.toggleItemSelectStatus(path.at(-1) ?? "");
                            });
                        }
                    })
                    .catch((error) => {
                        console.error("Error getting item:", error);
                    });
            }
        },
        [getItemPath, search],
    );

    return (
        <div className="mx-auto flex h-full flex-col justify-center gap-1">
            <form
                onSubmit={onSubmit}
                className="flex items-center justify-start gap-2"
            >
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                />
                <Button type="submit">Search</Button>
            </form>
            <ControlledTreeEnvironment<string>
                items={treeData}
                getItemTitle={(item) => item.data}
                canSearch={false}
                canSearchByStartingTyping={false}
                canRename={false}
                viewState={viewState}
                onExpandItem={(item, treeId) => {
                    setViewState((prevViewState) => ({
                        ...prevViewState,
                        [treeId]: {
                            ...prevViewState[treeId],
                            expandedItems: [
                                ...(prevViewState[treeId]?.expandedItems ?? []),
                                item.index,
                            ],
                        },
                    }));
                }}
                onCollapseItem={(item, treeId) => {
                    setViewState((prevViewState) => ({
                        ...prevViewState,
                        [treeId]: {
                            ...prevViewState[treeId],
                            expandedItems:
                                prevViewState[treeId]?.expandedItems?.filter(
                                    (id) => id !== item.index,
                                ) ?? [],
                        },
                    }));
                }}
                onFocusItem={(item, treeId) => {
                    setViewState((prevViewState) => ({
                        ...prevViewState,
                        [treeId]: {
                            ...prevViewState[treeId],
                            focusedItem: item.index,
                        },
                    }));
                }}
                onSelectItems={(items, treeId) => {
                    setViewState((prevViewState) => ({
                        ...prevViewState,
                        [treeId]: {
                            ...prevViewState[treeId],
                            selectedItems: [items.at(-1) ?? ""],
                        },
                    }));
                }}
                renderTreeContainer={({ children, containerProps }) => {
                    return (
                        <div
                            {...containerProps}
                            className="tree-container border border-border p-[1px]"
                        >
                            {children}
                        </div>
                    );
                }}
                renderLiveDescriptorContainer={({ }) => <></>}
                renderItemsContainer={({ children, containerProps }) => {
                    return <ul {...containerProps}>{children}</ul>;
                }}
                renderItem={({ title, item, arrow, context, depth, children }) => {
                    const indentation = 10 * depth;
                    return (
                        <li
                            {...context.itemContainerWithChildrenProps}
                            className="my-[1px] [&>button>svg]:aria-[expanded=true]:rotate-90 [&>button]:aria-[selected=true]:bg-primary/50"
                        >
                            <Button
                                {...(context.itemContainerWithoutChildrenProps)}
                                {...(context.interactiveElementProps)}
                                type="button"
                                variant="outline"
                                size="sm"
                                className={cn(
                                    "grid h-6 w-full grid-flow-col items-center justify-start gap-[2px] border-none text-xs shadow-none",
                                    "focus:bg-secondary/20",
                                )}
                                style={{
                                    paddingLeft: `${item.isFolder ? indentation : indentation + 16}px`,
                                }}
                            >
                                {item.isFolder && arrow}
                                {title}
                            </Button>
                            {children}
                        </li>
                    );
                }}
                renderItemArrow={({ context }) => {
                    return (
                        <ChevronRight {...context.arrowProps} className="!size-[14px]" />
                    );
                }}
                renderItemTitle={({ title }) => <span>{title}</span>}
            >
                <Tree
                    ref={tree}
                    treeId="tree-sample"
                    rootItem="root"
                    treeLabel="Sample Tree"
                />
            </ControlledTreeEnvironment>
        </div>
    );
};

export default TreeView;