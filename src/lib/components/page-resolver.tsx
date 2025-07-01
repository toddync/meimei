import { Badge } from "@/components/ui/badge";
import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import blooming from '../../assets/blooming.svg';
import { useCommandStore } from "../stores/command";
import { useMeimeiStore } from "../stores/meimei";
import { useTabStore } from "../stores/tabs";
import TabBar from "./tab-bar";
import TabBody from "./tab-body";

export default function PageResolver() {
    const tabs = useTabStore(state => state.tabs)
    const remove = useTabStore(state => state.remove)
    const toggleSidebar = useMeimeiStore(s => s.toggleSidebar)
    const toggleMenu = useCommandStore(s => s.toggle)

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "w" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                remove(useTabStore.getState().selectedIndex)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    if (!tabs || tabs.length == 0) {
        return (
            <div className="mx-auto my-auto flex flex-col gap-2 page-h">
                <img src={blooming} className='size-80 dark:opacity-70' />
                <span className="mx-auto text-muted-foreground">
                    So empty... Let's grow this garden together!
                </span>
                <div className="flex flex-col gap-2 *:w-fit *:mx-auto">
                    <span className="mx-auto text-muted-foreground">
                        Open a note in the
                        <span
                            onClick={() => {
                                if (localStorage.getItem("sidebar:open") != "true") {
                                    toggleSidebar()
                                }
                            }}
                            className="mx-0.5 underline decoration-primary decoration-2 underline-offset-4 cursor-pointer hover:text-primary"
                        >
                            sidebar
                        </span>
                        <Badge variant="outline">⌘+/</Badge>
                    </span>
                    <span className="mx-auto text-muted-foreground">
                        Open the
                        <span
                            onClick={() => {
                                toggleMenu()
                            }}
                            className="mx-0.5 underline decoration-primary decoration-2 underline-offset-4 cursor-pointer hover:text-primary"
                        >
                            quick note menu
                        </span>
                        <Badge variant="outline">⌘+k</Badge>
                    </span>
                    <span className="mx-auto text-muted-foreground">
                        Or create a note on the sidebar
                        <span className="mx-0.5 underline decoration-primary decoration-2 underline-offset-4">
                            plus button
                        </span>
                    </span>
                </div>
            </div>
        )
    }

    return (
        <>
            <TabBar />
            <TabContents />
        </>
    );
}

function TabContents() {
    const tabs = useTabStore(state => state.tabs)
    const selectedIndex = useTabStore(s => s.selectedIndex)
    const [api, setApi] = useState<CarouselApi>()

    useEffect(() => {
        api?.scrollSnapList().length != tabs.length && api?.reInit();
        api?.scrollTo(selectedIndex)

        setTimeout(() => {
            const currentSlide = document.querySelector(`[data-carousel-index="${selectedIndex}"]`);
            if (currentSlide) { //@ts-ignore
                currentSlide.style.display = 'none'; //@ts-ignore
                void currentSlide.offsetHeight; //@ts-ignore
                currentSlide.style.display = '';
            }
        }, 50);
    }, [api, selectedIndex])

    return (
        <Carousel className="max-h-full min-h-full grid" setApi={setApi} opts={{ watchDrag: false, dragFree: false }}>
            <CarouselContent className="min-h-full max-h-full">
                {tabs.map((tab, i) =>
                    <CarouselItem className="min-h-full max-h-full" data-carousel-index={i} key={tab.value}>
                        <TabBody tab={tab} />
                    </CarouselItem>
                )}
            </CarouselContent>
        </Carousel>
    )
}