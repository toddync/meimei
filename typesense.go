package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/fsnotify/fsnotify"

	typesense "github.com/typesense/typesense-go/v3/typesense"
	"github.com/typesense/typesense-go/v3/typesense/api"
)

type Typesense struct {
	Client *typesense.Client
}

type Document struct {
	ID            string    `json:"id,omitempty"`
	Title         string    `json:"title"`
	RelativePath  string    `json:"relative_path"`
	Content       string    `json:"content"`
	ContentBlocks []string  `json:"content_blocks"`
	Tags          []string  `json:"tags"`
	WikiLinks     []string  `json:"wiki_links"`
	Embeds        []string  `json:"embeds"`
	LastModified  time.Time `json:"last_modified"`
}

// ModTimeCache stores the last modification times of files
type ModTimeCache map[string]time.Time

const cacheFileName = ".meimei/mod_time_cache.json"

// LoadModTimeCache loads the modification time cache from a file
func LoadModTimeCache(root string) (ModTimeCache, error) {
	cachePath := filepath.Join(root, cacheFileName)
	cache := make(ModTimeCache)

	data, err := os.ReadFile(cachePath)
	if err != nil {
		if os.IsNotExist(err) {
			return cache, nil // Return empty cache if file doesn't exist
		}
		return nil, fmt.Errorf("failed to read cache file %s: %v", cachePath, err)
	}

	err = json.Unmarshal(data, &cache)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal cache data from %s: %v", cachePath, err)
	}
	return cache, nil
}

// SaveModTimeCache saves the modification time cache to a file
func SaveModTimeCache(root string, cache ModTimeCache) error {
	cacheDir := filepath.Join(root, ".meimei")
	if err := os.MkdirAll(cacheDir, 0755); err != nil {
		return fmt.Errorf("failed to create cache directory %s: %v", cacheDir, err)
	}

	cachePath := filepath.Join(root, cacheFileName)
	data, err := json.MarshalIndent(cache, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal cache data: %v", err)
	}

	err = os.WriteFile(cachePath, data, 0644)
	if err != nil {
		return fmt.Errorf("failed to write cache file %s: %v", cachePath, err)
	}
	return nil
}

func NewTypesense() *Typesense {
	return &Typesense{
		Client: typesense.NewClient(
			typesense.WithServer("http://localhost:8108"),
			typesense.WithAPIKey("xyz"),
		),
	}
}

func (t *Typesense) CreateCollection() error {
	ctx := context.Background()

	// Check if collection already exists
	_, err := t.Client.Collection("documents").Retrieve(ctx)
	if err == nil {
		log.Println("Collection 'documents' already exists")
		return nil
	}

	// Define collection schema
	schema := &api.CollectionSchema{
		Name: "documents",
		Fields: []api.Field{
			{Name: "id", Type: "string"},
			{Name: "title", Type: "string", Sort: boolPtr(true)},
			{Name: "relative_path", Type: "string"},
			{Name: "content", Type: "string"},
			{Name: "content_blocks", Type: "string[]"},
			{Name: "tags", Type: "string[]", Facet: boolPtr(true)},
			{Name: "wiki_links", Type: "string[]"},
			{Name: "embeds", Type: "string[]"},
			{Name: "last_modified", Type: "int64", Sort: boolPtr(true)}, // Store as Unix timestamp
		},
		DefaultSortingField: stringPtr("title"),
		EnableNestedFields:  boolPtr(true),
	}

	_, err = t.Client.Collections().Create(ctx, schema)
	if err != nil {
		return fmt.Errorf("failed to create collection: %v", err)
	}

	log.Println("Successfully created collection 'documents'")
	return nil
}

func (t *Typesense) DeleteCollection() error {
	ctx := context.Background()
	_, err := t.Client.Collection("documents").Delete(ctx)
	if err != nil {
		return fmt.Errorf("failed to delete collection: %v", err)
	}
	log.Println("Successfully deleted collection 'documents'")
	return nil
}

func (t *Typesense) IndexFolder(root string) (int, error) {
	var filesToIndex []string
	err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() && path != root && strings.HasPrefix(info.Name(), ".") {
			return filepath.SkipDir
		}
		if !info.IsDir() && strings.HasSuffix(info.Name(), ".md") {
			filesToIndex = append(filesToIndex, path)
		}
		return nil
	})

	if err != nil {
		return 0, fmt.Errorf("error collecting files in %s: %v", root, err)
	}

	var wg sync.WaitGroup
	var indexedCount int32
	errorChan := make(chan error, len(filesToIndex)) // Buffered channel to collect errors
	workerPool := make(chan struct{}, 5)             // Limit to 5 concurrent uploads

	for _, filePath := range filesToIndex {
		wg.Add(1)
		workerPool <- struct{}{} // Acquire a worker slot
		go func(fp string) {
			defer wg.Done()
			defer func() { <-workerPool }() // Release the worker slot

			doc, _, processErr := t.ProcessMarkdownFile(fp, root)
			if processErr != nil {
				errorChan <- fmt.Errorf("error processing markdown file %s: %v", fp, processErr)
				return
			}

			ctx := context.Background()
			_, upsertErr := t.Client.Collection("documents").Documents().Upsert(ctx, doc, &api.DocumentIndexParameters{})
			if upsertErr != nil {
				errorChan <- fmt.Errorf("error indexing document %s: %v", fp, upsertErr)
			} else {
				atomic.AddInt32(&indexedCount, 1)
				log.Printf("Successfully indexed: %s", fp)
			}
		}(filePath)
	}

	wg.Wait()
	close(errorChan)
	close(workerPool)

	var allErrors []string
	for err := range errorChan {
		allErrors = append(allErrors, err.Error())
	}

	if len(allErrors) > 0 {
		return int(indexedCount), fmt.Errorf("encountered %d errors during indexing: %s", len(allErrors), strings.Join(allErrors, "; "))
	}

	return int(indexedCount), nil
}

func (t *Typesense) ProcessMarkdownFile(path, root string) (*Document, time.Time, error) {
	info, err := os.Stat(path)
	if err != nil {
		return nil, time.Time{}, fmt.Errorf("error getting file info for %s: %v", path, err)
	}
	lastModified := info.ModTime()

	content, err := os.ReadFile(path)
	if err != nil {
		return nil, time.Time{}, fmt.Errorf("error reading file %s: %v", path, err)
	}

	contentStr := string(content)

	// Extract data directly from the content
	tags := extractTags(contentStr)
	wikiLinks := extractWikiLinks(contentStr)
	embeds := extractEmbeds(contentStr)
	contentBlocks := extractContentBlocks(contentStr)

	// Create document
	relPath, _ := filepath.Rel(root, path)
	doc := &Document{
		ID:            generateID(relPath),
		Title:         getTitle(path, contentStr),
		RelativePath:  relPath,
		Content:       contentStr,
		ContentBlocks: contentBlocks,
		Tags:          tags,
		WikiLinks:     wikiLinks,
		Embeds:        embeds,
		LastModified:  lastModified,
	}
	return doc, lastModified, nil
}

func extractTags(content string) []string {
	// tagPattern := regexp.MustCompile(`(?:^|\s)@([a-zA-Z][a-zA-Z0-9]*)`)
	tagPattern := regexp.MustCompile(`(?:^|\s)#([a-zA-Z][a-zA-Z0-9]*)`)
	matches := tagPattern.FindAllStringSubmatch(content, -1)
	tags := make([]string, 0, len(matches))
	for _, match := range matches {
		if len(match) > 1 {
			tags = append(tags, match[1])
		}
	}
	return tags
}

func extractWikiLinks(content string) []string {
	wikiPattern := regexp.MustCompile(`\[\[([^\[\]]+)\]\]`)
	matches := wikiPattern.FindAllStringSubmatch(content, -1)
	links := make([]string, 0, len(matches))
	for _, match := range matches {
		if len(match) > 1 {
			links = append(links, match[1])
		}
	}
	return links
}

func extractEmbeds(content string) []string {
	embedPattern := regexp.MustCompile(`!\[\[([^\[\]]+)\]\]`)
	matches := embedPattern.FindAllStringSubmatch(content, -1)
	embeds := make([]string, 0, len(matches))
	for _, match := range matches {
		if len(match) > 1 {
			embeds = append(embeds, match[1])
		}
	}
	return embeds
}

func getTitle(path string, content string) string {
	return strings.TrimSuffix(filepath.Base(path), ".md")
}

func generateID(relPath string) string {
	// Get just the file name without extension
	fileName := strings.TrimSuffix(filepath.Base(relPath), ".md")

	// Create a simple hash from the filename
	var hash uint64
	for i := 0; i < len(fileName); i++ {
		hash = hash*31 + uint64(fileName[i])
	}

	// Convert to string and ensure it's not longer than 511 bytes
	id := fmt.Sprintf("%d", hash)
	if len(id) > 511 {
		id = id[:511]
	}

	return id
}

// Helper functions for pointer values
func boolPtr(b bool) *bool {
	return &b
}

func stringPtr(s string) *string {
	return &s
}

func extractContentBlocks(content string) []string {
	// Regex to find fenced code blocks (```...```)
	codeBlockPattern := regexp.MustCompile("(?s)```.*?```")

	// Find all code blocks and their locations
	codeBlockMatches := codeBlockPattern.FindAllStringSubmatchIndex(content, -1)

	var blocks []string
	lastIndex := 0

	for _, match := range codeBlockMatches {
		// Add text before the code block as a paragraph block
		if match[0] > lastIndex {
			paragraph := strings.TrimSpace(content[lastIndex:match[0]])
			if paragraph != "" {
				// Split paragraphs by newlines and add each non-empty line as a block
				lines := strings.Split(paragraph, "\n")
				for _, line := range lines {
					trimmedLine := strings.TrimSpace(line)
					if trimmedLine != "" {
						blocks = append(blocks, trimmedLine)
					}
				}
			}
		}
		// Add the code block itself as a single block
		blocks = append(blocks, content[match[0]:match[1]])
		lastIndex = match[1]
	}

	// Add any remaining text after the last code block as paragraph blocks
	if lastIndex < len(content) {
		paragraph := strings.TrimSpace(content[lastIndex:])
		if paragraph != "" {
			// Split paragraphs by newlines and add each non-empty line as a block
			lines := strings.Split(paragraph, "\n")
			for _, line := range lines {
				trimmedLine := strings.TrimSpace(line)
				if trimmedLine != "" {
					blocks = append(blocks, trimmedLine)
				}
			}
		}
	}
	return blocks
}

func (t *Typesense) WatchFolderAndSync(root string, ctx context.Context) error {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		return fmt.Errorf("failed to create watcher: %v", err)
	}
	defer watcher.Close()

	done := make(chan bool)

	go func() {
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				log.Printf("Event: %s, Name: %s", event.Op.String(), event.Name)

				if strings.HasSuffix(event.Name, ".md") {
					switch event.Op {
					case fsnotify.Create, fsnotify.Write:
						log.Printf("Upserting document: %s", event.Name)
						_, err := t.UpsertDocument(event.Name, root)
						if err != nil {
							log.Printf("Error upserting document %s: %v", event.Name, err)
						}
					case fsnotify.Remove:
						log.Printf("Deleting document: %s", event.Name)
						err := t.DeleteDocument(event.Name, root)
						if err != nil {
							log.Printf("Error deleting document %s: %v", event.Name, err)
						}
					case fsnotify.Rename:
						// Rename events are tricky. A rename can be a move within the watched directory
						// or a move out of it. For simplicity, we'll treat it as a remove of the old path
						// and a potential create of the new path if it's still within the watched directory.
						// fsnotify sends a REMOVE event for the old path and a CREATE event for the new path.
						// We handle CREATE and REMOVE separately, so this case might not need explicit handling here.
						log.Printf("Rename event for %s. Handled by separate CREATE/REMOVE events.", event.Name)
					}
				}
			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				log.Printf("Watcher error: %v", err)
			case <-ctx.Done():
				log.Println("Stopping folder watcher due to context cancellation.")
				done <- true
				return
			}
		}
	}()

	err = watcher.Add(root)
	if err != nil {
		return fmt.Errorf("failed to add root folder to watcher: %v", err)
	}
	log.Printf("Watching folder: %s", root)

	<-done
	return nil
}

func (t *Typesense) UpsertDocument(filePath, root string) (int32, error) {
	doc, _, err := t.ProcessMarkdownFile(filePath, root)
	if err != nil {
		return 0, fmt.Errorf("error processing markdown file %s: %v", filePath, err)
	}

	ctx := context.Background()
	_, err = t.Client.Collection("documents").Documents().Upsert(ctx, doc, &api.DocumentIndexParameters{})
	if err != nil {
		return 0, fmt.Errorf("error indexing document %s: %v", filePath, err)
	}
	log.Printf("Successfully upserted: %s", filePath)
	return 1, nil
}

func (t *Typesense) DeleteDocument(filePath, root string) error {
	relPath, err := filepath.Rel(root, filePath)
	if err != nil {
		return fmt.Errorf("error getting relative path for %s: %v", filePath, err)
	}
	docID := generateID(relPath)

	ctx := context.Background()
	_, err = t.Client.Collection("documents").Document(docID).Delete(ctx)
	if err != nil {
		return fmt.Errorf("error deleting document %s (ID: %s): %v", filePath, docID, err)
	}
	log.Printf("Successfully deleted: %s (ID: %s)", filePath, docID)
	return nil
}

// SyncFolder compares local file modification times with a cache and updates Typesense.
func (t *Typesense) SyncFolder(root string) (int, error) {
	cache, err := LoadModTimeCache(root)
	if err != nil {
		return 0, fmt.Errorf("failed to load modification time cache: %v", err)
	}

	var filesToProcess []struct {
		Path         string
		RelativePath string
		LastModified time.Time
	}
	localFiles := make(map[string]bool) // Track files that exist locally

	err = filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() && path != root && strings.HasPrefix(info.Name(), ".") {
			return filepath.SkipDir
		}
		if !info.IsDir() && strings.HasSuffix(info.Name(), ".md") {
			relPath, err := filepath.Rel(root, path)
			if err != nil {
				return fmt.Errorf("error getting relative path for %s: %v", path, err)
			}
			localFiles[relPath] = true
			filesToProcess = append(filesToProcess, struct {
				Path         string
				RelativePath string
				LastModified time.Time
			}{
				Path:         path,
				RelativePath: relPath,
				LastModified: info.ModTime(),
			})
		}
		return nil
	})

	if err != nil {
		return 0, fmt.Errorf("error collecting files in %s: %v", root, err)
	}

	var wg sync.WaitGroup
	var indexedCount int32
	errorChan := make(chan error, len(filesToProcess)+len(cache)) // Max possible errors
	workerPool := make(chan struct{}, 5)                          // Limit to 5 concurrent operations

	newCache := make(ModTimeCache)
	var newCacheMutex sync.Mutex

	// Process local files (upsert/update)
	for _, file := range filesToProcess {
		if cachedTime, ok := cache[file.RelativePath]; !ok || file.LastModified.After(cachedTime) {
			wg.Add(1)
			workerPool <- struct{}{}
			go func(fp string, currentModTime time.Time, relativePath string) {
				defer wg.Done()
				defer func() { <-workerPool }()

				doc, _, processErr := t.ProcessMarkdownFile(fp, root)
				if processErr != nil {
					errorChan <- fmt.Errorf("error processing markdown file %s: %v", fp, processErr)
					return
				}

				ctx := context.Background()
				_, upsertErr := t.Client.Collection("documents").Documents().Upsert(ctx, doc, &api.DocumentIndexParameters{})
				if upsertErr != nil {
					errorChan <- fmt.Errorf("error upserting document %s: %v", fp, upsertErr)
				} else {
					atomic.AddInt32(&indexedCount, 1)
					log.Printf("Successfully synced (upserted): %s", fp)
					newCacheMutex.Lock()
					newCache[relativePath] = currentModTime
					newCacheMutex.Unlock()
				}
			}(file.Path, file.LastModified, file.RelativePath)
		} else {
			// File is up-to-date, add to new cache
			newCacheMutex.Lock()
			newCache[file.RelativePath] = cachedTime
			newCacheMutex.Unlock()
		}
	}

	wg.Wait() // Wait for all upsert/update goroutines to finish

	// Handle deletions: check cache for files not found locally
	for relPath, _ := range cache {
		if _, existsLocally := localFiles[relPath]; !existsLocally {
			wg.Add(1)
			workerPool <- struct{}{}
			go func(relativePath string) {
				defer wg.Done()
				defer func() { <-workerPool }()

				fullPath := filepath.Join(root, relativePath) // Reconstruct full path for logging
				deleteErr := t.DeleteDocument(fullPath, root)
				if deleteErr != nil {
					errorChan <- fmt.Errorf("error deleting document %s: %v", fullPath, deleteErr)
				} else {
					log.Printf("Successfully synced (deleted): %s", fullPath)
				}
			}(relPath)
		}
	}
	wg.Wait() // Wait for all deletion goroutines to finish

	close(errorChan)
	close(workerPool)

	var allErrors []string
	for err := range errorChan {
		allErrors = append(allErrors, err.Error())
	}

	if len(allErrors) > 0 {
		return int(indexedCount), fmt.Errorf("encountered %d errors during sync: %s", len(allErrors), strings.Join(allErrors, "; "))
	}

	// Save the updated cache
	err = SaveModTimeCache(root, newCache)
	if err != nil {
		return int(indexedCount), fmt.Errorf("failed to save modification time cache: %v", err)
	}

	return int(indexedCount), nil
}
