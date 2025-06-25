import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import TabContext from "@mui/lab/TabContext";
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { X } from "lucide-react";
import { useEffect } from "react";
import { useFilesStore } from "../stores/files";
import { Tab as Tab_, useTabStore } from "../stores/tabs";
import scrollButtons from './scroll-buttons';

export default function TabBar() {
    const tabs = useTabStore(state => state.tabs)
    const value = useTabStore(state => state.value)
    const select = useTabStore(state => state.select)
    const selectedIndex = useTabStore(state => state.selectedIndex)
    const setSelected = useFilesStore(s => s.setSelected)

    useEffect(() => {
        (async () => {
            let tabs = document.querySelectorAll(".css-veleun-MuiButtonBase-root-MuiTab-root")
            for (let i = 0; i < tabs.length; i++)
                tabs[i].classList.remove("css-veleun-MuiButtonBase-root-MuiTab-root")
        })()
        setSelected(value)
    }, [value, tabs])

    if (!tabs || tabs.length == 0) return <></>;
    return (
        //@ts-ignore
        <TabContext value={value} className="page-h TabContext">
            <div className='bg-muted-foreground/5 dark:bg-sidebar h-11 sticky top-0 z-50 border-b shadow-background shadow-2xl' >
                <Tabs
                    className="TabList"
                    scrollButtons="auto"
                    variant="scrollable"
                    value={selectedIndex}
                    slots={{ scrollButtons }}
                    onChange={(_, value) => select(value)}
                    TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
                >
                    {tabs.map((tab, i) => (
                        <div
                            className={cn(
                                buttonVariants({ variant: "outline" }),
                                "group relative max-w-56 min-w-24 px-1.5 border-b-0 rounded-b-none transition-none",
                                value == tab.value && "bg-background dark:bg-background h-10",
                                value != tab.value && "bg-accent dark:bg-sidebar h-[39px]"
                            )}
                        >
                            <Tab value={tab.value} className="Tab" />
                            <TabHead i={i} tab={tab} />
                        </div>
                    ))}
                </Tabs>
            </div>
        </TabContext>
    )
}

function TabHead({ i, tab }: { i: number, tab: Tab_ }) {
    const select = useTabStore(state => state.select)
    const remove = useTabStore(state => state.remove)
    const setSelected = useFilesStore(s => s.setSelected)

    let tabData = useTabStore(s => s.getData(tab.value))
    return (
        <>
            <button onClick={() => {
                select(tab.value)
                setSelected(tabData?.path)
            }} className="absolute size-full z-10 opacity-0" />
            <span className="overflow-hidden whitespace-nowrap text-ellipsis flex-1 text-center">
                {tabData?.name}
            </span>

            <Button
                size="icon"
                variant="ghost"
                onClick={() => { remove(i) }}
                className="size-fit p-0.5 my-auto z-20"
            >
                <X className="text-muted-foreground group-hover:text-red-600 transition-colors" />
            </Button>
        </>
    )
}