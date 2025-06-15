//@ts-nocheck
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar";
import { File as FileIcon, Folder } from "lucide-react";
import { useEffect, useMemo } from "react";
import { FileNode, useFilesStore } from "../stores/Files";
import { useTabStore } from "../stores/tab-store";
import { cn } from "../utils";

export default function Tree_() {
    const tree = useFilesStore(s => s.files.tree);

    console.log(tree)

    return (
        <SidebarMenu className="overflow-auto gap-0 flex-1 max-h-full w-[400px] max-w-[calc(100%_-_40px)]">
            {tree.map((item, index) => (
                <Tree key={index} path={item.path.replaceAll("//", "/")} children={item.children} />
            ))}
        </SidebarMenu>
    );
}

function Tree({ path, children }: { path: string, children: FileNode[] }) {
    const raw = useFilesStore(s => s.files.raw);
    const file = raw.find(f => f.path === path);
    const expanded = useFilesStore(s => s.isExpanded(path));
    const toggleExpanded = useFilesStore(s => s.toggleExpanded);
    const selected = useFilesStore(s => s.selected);
    const setSelected = useFilesStore(s => s.setSelected);
    const addTab = useTabStore(s => s.add);
    const selectTab = useTabStore(s => s.select);

    if (!file) return null;

    if (!file.dir) {
        return (
            <SidebarMenuButton
                onClick={() => {
                    addTab({ data: file, value: file.path, type: "editor" });
                    selectTab(file.path);
                    setSelected(file.path);
                }}
                className={cn(
                    "data-[active=true]:bg-transparent w-full overflow-hidden",
                    selected === file.path && "bg-primary/20"
                )}
            >
                <FileIcon className="shrink-0 stroke-muted-foreground" />
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                    {file.name}
                </span>
            </SidebarMenuButton>
        );
    }

    useEffect(() => {
        console.log(expanded, path)
    }, [expanded])


    return (
        <SidebarMenu className="gap-0">
            <SidebarMenuItem>
                <Accordion type="multiple" className="w-full m-0"
                    value={expanded ? path : ""}
                >
                    <AccordionItem value={path}>
                        <AccordionTrigger
                            className={cn(
                                buttonVariants({ variant: "ghost" }),
                                "justify-between items-start w-full overflow-hidden"
                            )}
                            onClick={() => toggleExpanded(path)}
                        >
                            <div className="flex gap-2 items-center overflow-hidden">
                                <Folder className="shrink-0" />
                                <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                                    {file.name}
                                </span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-1">
                            <SidebarMenu className="pl-1 border-l gap-0">
                                {children.map((item, index) => (
                                    <Tree key={index} path={item.path.replaceAll("//", "/")} children={item.children} />
                                ))}
                            </SidebarMenu>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
