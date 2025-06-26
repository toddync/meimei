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
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { flowerLotus } from "@lucide/lab"
import { getVersion } from '@tauri-apps/api/app'
import { join, sep, } from "@tauri-apps/api/path"
import { open } from '@tauri-apps/plugin-dialog'
import { mkdir } from "@tauri-apps/plugin-fs"
import { FolderOpen, Icon, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useMeimeiStore } from "../stores/meimei"

export default function WorkspaceManager() {
    let open = useMeimeiStore(s => s.showManager)
    let setOpen = useMeimeiStore(s => s.setShowManager)

    const [api, setApi] = useState<CarouselApi>()
    const [page, setPage] = useState<number>(1)
    let [version, setVersion] = useState<string>()

    useEffect(() => {
        if (!api) { return }
        setPage(api.selectedScrollSnap() + 1)
        api.on("select", () => setPage(api.selectedScrollSnap() + 1));

        (async () => {
            setVersion(await getVersion())
        })()
    }, [api])

    return (
        <Dialog open={open} onOpenChange={setOpen} modal>
            <DialogContent className="flex flex-col gap-6 focus:outline-none">
                <div className="text-center space-y-2">
                    <Icon iconNode={flowerLotus} className="mx-auto size-10 stroke-primary stroke-[0.6]" />
                    <DialogTitle>
                        Meimei
                        <DialogDescription>
                            v{version}
                        </DialogDescription>
                    </DialogTitle>
                </div>

                <div className="relative mx-10">
                    <Carousel setApi={setApi} opts={{ watchDrag: false }}>
                        <CarouselContent>
                            <CarouselItem>
                                <Content setPage={(i) => api?.scrollTo(i)} />
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

function Content({ setPage }: { setPage: (i: number) => void }) {
    let addWorkspace = useMeimeiStore(s => s.addWorkspace)
    let workspaces = useMeimeiStore(s => s.workspaces)

    const [open_, setOpen] = useState<boolean>(false)
    const [value, setValue] = useState<string>()

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
        <div className="flex items-center justify-between">
            <DialogDescription>Create a new Garden</DialogDescription>
            <Button size="icon" className="cursor-pointer" aria-label="Create Garden" onClick={() => setPage(1)}>
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
        <Separator />
        <div className="flex items-center justify-between">
            <DialogDescription>Delete Garden</DialogDescription>
            <div className="flex gap-1">
                <Select value={value} onValueChange={setValue}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a Garden..." />
                    </SelectTrigger>
                    <SelectContent>
                        {workspaces.map(w =>
                            <SelectItem value={w}>{w.split(sep()).pop()}</SelectItem>
                        )}
                    </SelectContent>
                </Select>
                <Button size="icon" className="cursor-pointer" aria-label="Delete garden button" onClick={() => setOpen(true)}>
                    <Trash2 />
                </Button>
                <ConfirmDialog open={open_} setOpen={setOpen} toDelete={value} />
            </div>
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


function ConfirmDialog({ open, setOpen, toDelete }: { toDelete?: string, open: boolean, setOpen: (i: boolean) => void }) {
    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                    This action won't delete your notes, only hide the garden from the lists. You can always undo this by opening the folder as a garden later.
                </DialogDescription>
            </DialogHeader>
            <div className="flex gap-5 *:flex-1">
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button variant="outline" onClick={() => {
                    toDelete && useMeimeiStore.getState().removeWorkspace(toDelete);
                    setOpen(false)
                }}>
                    Delete
                </Button>
            </div>
        </DialogContent>
    </Dialog>
}
