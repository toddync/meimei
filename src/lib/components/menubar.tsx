import { flowerLotus } from "@lucide/lab";
import { Icon } from "lucide-react";
import DotsMenu from "./dots-menu";
import MenubarMenu from "./menubar-menu";

export default function Menubar() {
    return <div data-tauri-drag-region className="h-8 bg-accent border-b flex z-[999] overflow-y-clip">
        <div className="w-12 flex">
            <div className="mx-auto text-sidebar-primary flex aspect-square size-8 items-center justify-center">
                <Icon iconNode={flowerLotus} className="size-5 stroke-[1.5]" />
            </div>
        </div>

        <MenubarMenu />

        <DotsMenu />
    </div>
}