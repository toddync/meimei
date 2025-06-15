import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import TabContext from '@mui/lab/TabContext';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { X } from "lucide-react";
import { useEffect } from "react";
import { useTabStore } from "../stores/tab-store";
import scrollButtons from './scrollButtons';
import TabBody from "./tab-body";

export default function PageResolver() {
    const tabs = useTabStore(state => state.tabs)
    const value = useTabStore(state => state.value)
    const select = useTabStore(state => state.select)
    const remove = useTabStore(state => state.remove)
    const selectedIndex = useTabStore(state => state.selectedIndex)

    useEffect(() => {
        let tabs = document.querySelectorAll(".css-veleun-MuiButtonBase-root-MuiTab-root")
        for (let i = 0; i < tabs.length; i++)
            tabs[i].classList.remove("css-veleun-MuiButtonBase-root-MuiTab-root")
    }, [value, tabs])

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "w" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                remove(selectedIndex)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    if (!tabs || tabs.length == 0) return;


    return (
        //@ts-ignore
        <TabContext value={value} className="page-h TabContext">
            <div className='bg-muted-foreground/5 dark:bg-sidebar max-h-11 sticky top-0 z-50 border-b'>
                <Tabs
                    className="TabList"
                    scrollButtons="auto"
                    variant="scrollable"
                    // value={selectedIndex}
                    slots={{ scrollButtons }}
                    onChange={(_, value) => select(value)}
                    TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
                >
                    {tabs.map((tab, i) => (
                        <div
                            key={tab.value}
                            className={cn(
                                buttonVariants({ variant: "outline" }),
                                "group relative max-w-56 min-w-24 px-1.5 border-b-0 rounded-b-none transition-none",
                                value == tab.value && "bg-background dark:bg-background h-10",
                                value != tab.value && "bg-accent dark:bg-sidebar h-[39px]"
                            )}
                        >
                            <Tab value={tab.value} disableRipple className="Tab" />
                            <button onClick={() => select(tab.value)} className="absolute size-full z-10 opacity-0" />
                            <span className="overflow-hidden whitespace-nowrap text-ellipsis">
                                {tab.data.name}
                            </span>

                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => { remove(i) }}
                                className="size-fit p-0.5 my-auto z-20"
                            >
                                <X className="text-muted-foreground group-hover:text-red-600 transition-colors" />
                            </Button>
                        </div>
                    ))}
                </Tabs>
            </div>

            {tabs.map((tab) => <TabBody tab={tab} key={tab.value} />)}
        </TabContext>
    );
}