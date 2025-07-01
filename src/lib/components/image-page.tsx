import { Button } from "@/components/ui/button";
import { Eraser, FlipHorizontal2Icon, FlipVertical2Icon, Minus, Plus, Redo, Undo } from "lucide-react";
import { useRef } from "react";
import Viewer from 'react-viewer';
import { useFilesStore } from "../stores/files";

export default function ImagePage({ file }: { file: { path: string } }) {
    const src = useFilesStore(s => s.assetUrls[file.path]);
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={containerRef} className="flex-1">
            {src && (
                <Viewer //@ts-ignore
                    container={containerRef.current}
                    images={[{ src }]}
                    showTotal={false}
                    zoomSpeed={0.2}
                    noNavbar
                    noClose
                    visible
                    customToolbar={(e) => {
                        return e.map(v => {
                            v.render = <> {/* @ts-ignore */}
                                <Button size="icon" onClick={v.onClick}>
                                    {v.key == "zoomIn" && <Plus />}
                                    {v.key == "zoomOut" && <Minus />}
                                    {v.key == "reset" && <Eraser />}
                                    {v.key == "rotateLeft" && <Undo />}
                                    {v.key == "rotateRight" && <Redo />}
                                    {v.key == "scaleX" && <FlipHorizontal2Icon />}
                                    {v.key == "scaleY" && <FlipVertical2Icon />}
                                </Button>
                            </>
                            return [
                                "zoomIn",
                                "zoomOut",
                                "reset",
                                "rotateLeft",
                                "rotateRight",
                                "scaleX",
                                "scaleY"
                            ].includes(v.key) && v
                        }).filter(e => e != false)
                    }}
                />
            )}
        </div>
    );
}