import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { useFilesStore } from "../stores/files"
import { Button } from "@/components/ui/button"

export default function FileDialog() {
    const open = useFilesStore(s => s.dialogOpen)
    const setOpen = useFilesStore(s => s.setDialogOpen)
    const context = useFilesStore(s => s.dialogContext)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                {context.action == "delete" && <>
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete your file.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 *:flex-1">
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button variant="outline" onClick={() => {
                            useFilesStore.getState().removeFile(context.path)
                            setOpen(false)
                        }}>
                            Delete
                        </Button>
                    </div>
                </>
                }

                {context.action == "rename" &&
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete your file.
                        </DialogDescription>
                    </DialogHeader>
                }

                {context.action == "create" &&
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete your file.
                        </DialogDescription>
                    </DialogHeader>
                }
            </DialogContent>
        </Dialog>
    )
}