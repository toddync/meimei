import { Circle } from "lucide-react";
import { useWindowStore } from "../stores/window";
import { Window } from "@tauri-apps/api/window";
import { useMeimeiStore } from "../stores/meimei";

export default function DotsMenu() {
    //@ts-ignore
    let window: Window = useWindowStore(s => s.window);
    let deactivateWorkspace = useMeimeiStore(s => s.deactivateWorkspace)
    let root = useMeimeiStore(s => s.workRoot)

    return (
        <div
            className="ml-auto w-20 h-min flex gap-1.5 px-3 py-2 select-none group *:rounded-full *:size-4 *:transition-colors *:cursor-pointer *:mx-auto *:stroke-3"
        >
            <Circle onClick={() => {
                deactivateWorkspace(root)
            }} className="group-hover:bg-[#FF605C] stroke-[#FF605C]" />
            <Circle onClick={() => window?.toggleMaximize()} className="group-hover:bg-[#FFBD44] stroke-[#FFBD44] delay-100" />
            <Circle onClick={() => window?.minimize()} className="group-hover:bg-[#00CA4E] stroke-[#00CA4E] delay-200" />
        </div>
    )
}