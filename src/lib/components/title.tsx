import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TriangleAlert } from "lucide-react";
import React, { useEffect, useRef, useCallback } from "react";

export default function Title({ value, error, onChange }: { value: string; error: boolean; onChange: (val: string) => void }) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const sizerRef = useRef<HTMLDivElement>(null);

    const autoResize = useCallback(() => {
        const textareaEl = textareaRef.current;
        const sizerEl = sizerRef.current;
        if (textareaEl && sizerEl) {
            sizerEl.textContent = textareaEl.value + "\u200b";
            const height = sizerEl.scrollHeight;
            textareaEl.style.height = `${height}px`;
        }
    }, []);

    useEffect(() => {
        autoResize();
    }, [value, autoResize]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
        autoResize();
    };

    return (
        <div className="relative max-w-5xl w-full mx-auto">
            {error && <TooltipProvider>
                <Tooltip >
                    <TooltipTrigger className="absolute -translate-y-1/2 -translate-x-1/2">
                        <TriangleAlert className="stroke-amber-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>There was an error, this title isn't applied yet</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            }
            <div
                ref={sizerRef}
                className="w-full max-h-52 text-4xl font-extrabold px-5 whitespace-pre-wrap break-words"
                style={{
                    visibility: "hidden",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                }}
            />

            <textarea
                ref={textareaRef}
                rows={1}
                value={value}
                onChange={handleChange}
                className="w-full text-4xl font-extrabold resize-none overflow-hidden border-none focus:outline-none bg-transparent px-5"
                style={{ height: "auto" }}
            />
            <Separator className="mt-5 mx-auto !w-[80%]" />
        </div>
    );
}
