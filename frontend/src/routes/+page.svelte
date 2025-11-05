<script lang="ts">
    import Editor from "$lib/components/Editor.svelte";
    import Search from "$lib/components/Search.svelte";
    import { IndexFolder } from "$lib/wailsjs/go/main/App";
    import { toast } from "svelte-sonner";

    $effect(() => {
        document.title = "Mei - Your Personal Knowledge Base";

        (async () => {
            IndexFolder("/home/danny/projects/5etools-obsidian/final").then((e) => {
                console.log(e);
                toast.success(e);
            });
        })()
    });
</script>

<Search />
<Editor />
