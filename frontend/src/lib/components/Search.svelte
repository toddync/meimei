<script lang="ts">
    import * as Command from "$lib/components/ui/command";
    import { Spinner } from "$lib/components/ui/spinner";
    import { searchStore } from "$lib/stores/Search.svelte";

    let query = $state("");
    let open = $state(false);

    let searchResults = $state<any[]>([]);
    let isLoading = $state(false);

    async function search(q: string) {
        const trimmedQuery = q.trim();
        if (!trimmedQuery) {
            searchResults = [];
            return;
        }

        isLoading = true;

        console.log("Searching for:", trimmedQuery);

        searchStore
            .quickSearch(trimmedQuery)
            .then((results) => {
                console.log("Search results:", results);
                searchResults = results;
            })
            .catch((error) => {
                console.error("Search error:", error);
                searchResults = [];
            })
            .finally(() => {
                isLoading = false;
            });
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            open = !open;
        }
    }

    $effect(() => {
        search(query);
    });
</script>

<svelte:document onkeydown={handleKeydown} />

<Command.Dialog bind:open shouldFilter={false} id="bits-c731">
    <Command.Input
        placeholder="Type a command or search..."
        bind:value={query}
    />
    <Command.List class="relative">
        <Command.Empty class="flex items-center justify-center space-x-2">
            {#if isLoading}
                Searching... <Spinner />
            {:else if query}
                No results found for "{query}"
            {:else}
                Start typing to search...
            {/if}
        </Command.Empty>

        <Command.Group>
            {#each searchResults || [] as hit}
                <Command.Item
                    class="whitespace-nowrap overflow-ellipsis max-w-full"
                >
                    <span>
                        {hit.document.title}
                    </span>

                    <span class="text-xs text-muted-foreground ml-2">
                        {hit.document.relative_path}
                    </span>
                </Command.Item>
            {/each}
        </Command.Group>
    </Command.List>

    {#if searchResults.length > 0}
        <div
            class="px-3 py-1 text-sm text-muted-foreground absolute bottom-1 right-1 bg-background p-1.5 border rounded-sm"
        >
            {searchResults.length} result{searchResults.length === 1 ? "" : "s"}
            found
        </div>
    {/if}
</Command.Dialog>
