import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function scrollButtons(props: { onClick: () => {}, disabled: boolean, direction: "left" | "right" }) {
    return <Button
        variant="outline"
        size="icon"
        onClick={props.onClick}
        disabled={props.disabled}
        className={
            "!min-w-0 disabled:!w-0 disabled:!border-0 overflow-hidden hover:text-primary mx-1.5"
        }>
        {props.direction == "left" ? <ChevronDown className='rotate-90 animate-bounce' /> : <ChevronUp className='rotate-90 animate-bounce' />}
    </Button>
}