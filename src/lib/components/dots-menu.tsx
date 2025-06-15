import { Circle } from "lucide-react";
import { useWindowStore } from "../stores/window";
import { Window } from "@tauri-apps/api/window";

export default function DotsMenu() {
    //@ts-ignore
    let window: Window = useWindowStore(s => s.window);

    return (
        <div className="ml-auto w-20 h-min flex gap-1.5 px-3 py-2 group *:rounded-full *:size-4 *:transition-colors *:cursor-pointer *:mx-auto *:stroke-[5px] dark:*:stroke-3">
            <Circle onClick={() => window?.close()} className="group-hover:bg-[#FF605C] stroke-[#FF605C]" />
            <Circle onClick={() => window?.toggleMaximize()} className="group-hover:bg-[#FFBD44] stroke-[#FFBD44] delay-100" />
            <Circle onClick={() => window?.minimize()} className="group-hover:bg-[#00CA4E] stroke-[#00CA4E] delay-200" />
        </div>
    )
}