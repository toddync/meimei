<script>
    import {
        Quit,
        WindowMinimise,
        WindowToggleMaximise
    } from "$lib/wailsjs/runtime/runtime";
    import Circle from "@lucide/svelte/icons/circle";
</script>

<div
    style="--wails-draggable: drag"
    class="w-svw h-8 border-b bg-accent flex fixed top-0 z-[100]"
>
    <div
        style="--wails-draggable: nodrag"
        class="mr-auto my-auto w-20 h-min flex gap-1.5 px-3 py-2 select-none group *:rounded-full *:size-4 *:transition-colors *:cursor-pointer *:mx-auto *:stroke-3"
    >
        <Circle
            onclick={() => {
                Quit();
            }}
            class="group-hover:bg-[#FF605C] stroke-[#FF605C]"
        />
        <Circle
            onclick={() => {
                WindowToggleMaximise();
            }}
            class="group-hover:bg-[#FFBD44] stroke-[#FFBD44] delay-100"
        />
        <Circle
            onclick={async () => {
                WindowMinimise();
            }}
            class="group-hover:bg-[#00CA4E] stroke-[#00CA4E] delay-200"
        />
    </div>
</div>
