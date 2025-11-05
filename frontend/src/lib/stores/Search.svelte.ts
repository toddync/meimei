import { GetPort } from '$lib/wailsjs/go/main/App'
import { Index, Meilisearch } from 'meilisearch'

export type Document = {
    id: string
    title: string
    relative_path: string
    content: string
    content_blocks: string[]
    tags: string[]
    wiki_links: string[]
    embeds: string[]
    last_modified: number
}

class Search {
    client: Meilisearch | null = null;
    index: Index<Document> | null = null;

    constructor(key: string) {
        (async () => {
            const port = await GetPort()
            console.log('Connecting to Meilisearch on port', port)

            this.client = new Meilisearch({
                host: `http://127.0.0.1:${port}`,
                apiKey: key,
            })

            this.client.getIndexes().then((indexes) => {
                console.log('Existing indexes:', indexes)
            })
    
            this.index = this.client.index('documents')
        })()
    }

    async quickSearch(query: string, limit: number = 50): Promise<Document[]> {
        if (!this.index) {
            return Promise.reject('Search index not initialized')
        }

        let results = await this.index.search(query, {
            limit: limit,
            attributesToSearchOn: ['title', 'relative_path'],
            
        })

        console.log(results)

        return results.hits as Document[];
    }
}

export const searchStore = new Search('o7585dbrg7tGJoTbHXQ3raBwkiyjbp9p3VAHwsy7Hr0')