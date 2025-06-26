import { Button } from "@/components/ui/button"
import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
    CarouselPrevious
} from "@/components/ui/carousel"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle
} from "@/components/ui/dialog"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { flowerLotus } from "@lucide/lab"
import { join, sep, } from "@tauri-apps/api/path"
import { open } from '@tauri-apps/plugin-dialog'
import { FolderOpen, Icon, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { useMeimeiStore } from "../stores/meimei"
import { toast } from "sonner"
import { mkdir } from "@tauri-apps/plugin-fs"

export default function WorkspaceDialog() {
    let root = useMeimeiStore(s => s.workRoot)

    const [api, setApi] = useState<CarouselApi>()
    const [page, setPage] = useState<number>(1)

    useEffect(() => {
        if (!api) { return }
        setPage(api.selectedScrollSnap() + 1)
        api.on("select", () => setPage(api.selectedScrollSnap() + 1))
    }, [api])

    return (
        <Dialog open={!root}>
            <DialogContent showCloseButton={false} className="flex flex-col gap-6 focus:outline-none">
                <div className="text-center space-y-2">
                    <Icon iconNode={flowerLotus} className="mx-auto size-10 stroke-primary stroke-[0.6]" />
                    <DialogTitle>Welcome to Meimei!</DialogTitle>
                </div>

                <div className="relative mx-10">
                    <Carousel setApi={setApi} opts={{ watchDrag: false }}>
                        <CarouselContent>
                            <CarouselItem>
                                <Content setCreate={() => api?.scrollNext()} />
                            </CarouselItem>
                            <CarouselItem>
                                <Create />
                            </CarouselItem>
                        </CarouselContent>

                        {page > 1 && <CarouselPrevious />}
                    </Carousel>
                </div>
            </DialogContent >
        </Dialog >
    )
}

function Content({ setCreate }: { setCreate: (i: boolean) => void }) {
    let addWorkspace = useMeimeiStore(s => s.addWorkspace)

    async function openAs() {
        const file = await open({
            multiple: false,
            directory: true,
            canCreateDirectories: true,
            title: "Choose a Folder"
        });
        if (file) addWorkspace(file)
    }

    return <div className="flex flex-col gap-6 focus:outline-none">
        <div className="text-center text-sm text-muted-foreground">
            To get started, create a &#8203; <Garden />.
        </div>
        <div className="flex items-center justify-between">
            <DialogDescription>Create a new Garden</DialogDescription>
            <Button size="icon" className="cursor-pointer" aria-label="Create Garden" onClick={() => setCreate(true)}>
                <Plus />
            </Button>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
            <DialogDescription>Open a folder as a Garden</DialogDescription>
            <Button size="icon" className="cursor-pointer" aria-label="Open Garden Folder" onClick={openAs}>
                <FolderOpen />
            </Button>
        </div>
    </div>
}

function Create() {
    let addWorkspace = useMeimeiStore(s => s.addWorkspace)
    const [folder, setFolder] = useState<string>()
    const [name, setName] = useState<string>()

    return <div className="flex flex-col gap-6 focus:outline-none">
        <div className="text-center text-sm text-muted-foreground">
            Create a new &#8203; <Garden />.
        </div>
        <div className="flex gap-3 items-center justify-between">
            <DialogDescription className="whitespace-nowrap">
                Garden location
            </DialogDescription>

            <span className="flex-1 cursor-pointer" onClick={async () => {
                let b = folder?.split(sep());
                b?.pop();
                let folder_ = await open({
                    multiple: false,
                    directory: true,
                    canCreateDirectories: true,
                    title: "Choose a Folder",
                    defaultPath: b?.join(sep()),
                })
                if (folder_) setFolder(folder_)
            }}>
                <Input
                    placeholder="Choose a folder..."
                    className="text-ellipsis overflow-auto pointer-events-none" value={folder}
                />
            </span>
        </div>
        <Separator />
        <div className="flex gap-3 items-center justify-between">
            <DialogDescription className="whitespace-nowrap">Choose a name</DialogDescription>
            <Input
                value={name}
                placeholder="Enter a name..."
                onChange={(e) => {
                    setName(e.target.value)
                }}
            />
        </div>

        <Button onClick={async () => {
            try {
                if (folder && name) {
                    let path = await join(folder, name)
                    await mkdir(path)
                    addWorkspace(path)
                }
                else toast.warning("Please fill both fields.", { description: "Both location and name need to filled." })
            } catch (error) {
                toast.error("Event has been created.")
            }
        }}>Create garden</Button>
    </div>
}

function Garden() {
    return <HoverCard openDelay={100}>
        <HoverCardTrigger className="underline decoration-primary decoration-2 underline-offset-4">
            garden
        </HoverCardTrigger>
        <HoverCardContent className="text-left text-sm max-w-sm">
            A garden is like a workspace — a folder where your notes are stored.
        </HoverCardContent>
    </HoverCard>
}