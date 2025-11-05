package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"strings"
	"sync"
	"sync/atomic"
	"syscall"
	"time"

	"github.com/fsnotify/fsnotify"
	meilisearch "github.com/meilisearch/meilisearch-go"
)

type Meilisearch struct {
	Client meilisearch.ServiceManager
}

type MeiliDocument struct {
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

// MeiliModTimeCache stores the last modification times of files
type MeiliModTimeCache map[string]time.Time

const meiliCacheFileName = ".meimei/meili_mod_time_cache.json"

const meiliHost = "http://localhost:7700"
const meiliMasterKey = "o7585dbrg7tGJoTbHXQ3raBwkiyjbp9p3VAHwsy7Hr0"

// MeiliLoadModTimeCache loads the modification time cache from a file
func MeiliLoadModTimeCache(root string) (MeiliModTimeCache, error) {
	cachePath := filepath.Join(root, meiliCacheFileName)
	cache := make(MeiliModTimeCache)

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

// MeiliSaveModTimeCache saves the modification time cache to a file
func MeiliSaveModTimeCache(root string, cache MeiliModTimeCache) error {
	cacheDir := filepath.Join(root, ".meimei")
	if err := os.MkdirAll(cacheDir, 0755); err != nil {
		return fmt.Errorf("failed to create cache directory %s: %v", cacheDir, err)
	}

	cachePath := filepath.Join(root, meiliCacheFileName)
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

func NewMeilisearch(meilisearchHost string) *Meilisearch {
	var option meilisearch.Option
	if meiliMasterKey != " " {
		option = meilisearch.WithAPIKey(meiliMasterKey)
	}
	return &Meilisearch{
		Client: meilisearch.New(meilisearchHost, option),
	}
}

func (m *Meilisearch) StartMeilisearch(binaryPath, configDir string, port int) error {
	cmd := exec.Command(
		binaryPath,
		"--db-path", path.Join(configDir, "meilisearch_data"),
		"--http-addr", fmt.Sprintf("localhost:%d", port),
		"--master-key", meiliMasterKey,
	)

	// Run the command in the background
	cmd.SysProcAttr = &syscall.SysProcAttr{
		Setsid: true,
	}

	err := cmd.Start()
	if err != nil {
		return fmt.Errorf("failed to start Meilisearch: %w", err)
	}

	log.Printf("Meilisearch started in background on port %d with config dir %s", port, configDir)
	return nil
}

func (m *Meilisearch) DeleteCollection() error {
	task, err := m.Client.DeleteIndex("documents")
	if err != nil {
		return fmt.Errorf("failed to delete index: %v", err)
	}

	_, err = m.Client.WaitForTask(task.TaskUID, 1000)
	if err != nil {
		return fmt.Errorf("failed to wait for delete index task: %v", err)
	}

	log.Println("Successfully deleted index 'documents'")
	return nil
}

func (m *Meilisearch) IndexFolder(root string, batchSize int) (int, error) {
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

	var (
		documents      []Document
		documentsMutex sync.Mutex
		batch          []Document
	)
	_ = documents // Remove unused variable warning

	processDocument := func(fp string) error {
		doc, _, processErr := m.ProcessMarkdownFile(fp, root)
		if processErr != nil {
			return fmt.Errorf("error processing markdown file %s: %v", fp, processErr)
		}

		documentsMutex.Lock()
		batch = append(batch, *doc)
		documentsMutex.Unlock()
		return nil
	}

	// Iterate over the files and process them in batches
	for i, filePath := range filesToIndex {
		wg.Add(1)
		workerPool <- struct{}{}
		go func(fp string) {
			defer wg.Done()
			defer func() { <-workerPool }()

			if err := processDocument(fp); err != nil {
				errorChan <- err
				return
			}

			if (i+1)%batchSize == 0 || i == len(filesToIndex)-1 {
				documentsMutex.Lock()
				docs := batch
				batch = []Document{}
				documentsMutex.Unlock()

				if len(docs) > 0 {
					task, err := m.Client.Index("documents").UpdateDocuments(docs, nil)
					if err != nil {
						log.Printf("error adding documents to Meilisearch: %v", err)
						errorChan <- fmt.Errorf("error adding documents to Meilisearch: %v", err)
					} else {
						completedTask, err := m.Client.WaitForTask(task.TaskUID, 1000)
						if err != nil {
							log.Printf("error waiting for add documents task %d: %v", task.TaskUID, err)
							errorChan <- fmt.Errorf("error waiting for add documents task %d: %v", task.TaskUID, err)
						} else if completedTask.Status == "failed" {
							log.Printf("Meilisearch task %d failed. Error: %+v", completedTask.TaskUID, completedTask.Error)
							errorChan <- fmt.Errorf("meilisearch task %d failed: %s", completedTask.TaskUID, completedTask.Error.Message)
						} else {
							// log.Printf("Successfully indexed %d documents.", len(docs))
							atomic.AddInt32(&indexedCount, int32(len(docs)))
						}
					}
				}
			}
		}(filePath)
	}

	wg.Wait()
	close(workerPool)

	close(errorChan)

	var allErrors []string
	for err := range errorChan {
		allErrors = append(allErrors, err.Error())
	}

	if len(allErrors) > 0 {
		log.Printf("encountered %d errors during indexing: %s", len(allErrors), strings.Join(allErrors, "; "))
		return int(indexedCount), fmt.Errorf("encountered %d errors during indexing: %s", len(allErrors), strings.Join(allErrors, "; "))
	}

	return int(indexedCount), nil
}

func (m *Meilisearch) ProcessMarkdownFile(path, root string) (*Document, time.Time, error) {
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

	// Log the size of ContentBlocks
	// log.Printf("Document ID: %s, ContentBlocks size: %d", doc.ID, len(doc.ContentBlocks))

	return doc, lastModified, nil
}

func (m *Meilisearch) WatchFolderAndSync(root string, ctx context.Context) error {
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
						_, err := m.UpsertDocument(event.Name, root)
						if err != nil {
							log.Printf("Error upserting document %s: %v", event.Name, err)
						}
					case fsnotify.Remove:
						log.Printf("Deleting document: %s", event.Name)
						err := m.DeleteDocument(event.Name, root)
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
	return nil
}

func (m *Meilisearch) UpsertDocument(filePath, root string) (int32, error) {
	doc, _, err := m.ProcessMarkdownFile(filePath, root)
	if err != nil {
		return 0, fmt.Errorf("error processing markdown file %s: %v", filePath, err)
	}

	task, err := m.Client.Index("documents").UpdateDocuments([]Document{*doc}, nil)
	if err != nil {
		log.Printf("error adding document %s to Meilisearch: %v", filePath, err)
		return 0, fmt.Errorf("error adding document %s to Meilisearch: %v", filePath, err)
	}

	_, err = m.Client.WaitForTask(task.TaskUID, 1000)
	if err != nil {
		log.Printf("error waiting for add document task for %s: %v", filePath, err)
		return 0, fmt.Errorf("error waiting for add document task for %s: %v", filePath, err)
	}

	log.Printf("Successfully upserted: %s", filePath)
	return 1, nil
}

func (m *Meilisearch) DeleteDocument(filePath, root string) error {
	relPath, err := filepath.Rel(root, filePath)
	if err != nil {
		return fmt.Errorf("error getting relative path for %s: %v", filePath, err)
	}
	docID := generateID(relPath)

	task, err := m.Client.Index("documents").DeleteDocument(docID)
	if err != nil {
		return fmt.Errorf("error deleting document %s (ID: %s): %v", filePath, docID, err)
	}

	_, err = m.Client.WaitForTask(task.TaskUID, 1000)
	if err != nil {
		return fmt.Errorf("error waiting for delete document task for %s: %v", filePath, err)
	}

	log.Printf("Successfully deleted: %s (ID: %s)", filePath, docID)
	return nil
}

// SyncFolder compares local file modification times with a cache and updates Typesense.
func (m *Meilisearch) SyncFolder(root string) (int, error) {
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

				doc, _, processErr := m.ProcessMarkdownFile(fp, root)
				if processErr != nil {
					errorChan <- fmt.Errorf("error processing markdown file %s: %v", fp, processErr)
					return
				}

				task, upsertErr := m.Client.Index("documents").UpdateDocuments([]Document{*doc}, nil)
				if upsertErr != nil {
					errorChan <- fmt.Errorf("error upserting document %s: %v", fp, upsertErr)
				} else {
					_, err := m.Client.WaitForTask(task.TaskUID, 1000)
					if err != nil {
						errorChan <- fmt.Errorf("error waiting for upsert document task for %s: %v", fp, err)
					} else {
						atomic.AddInt32(&indexedCount, 1)
						log.Printf("Successfully synced (upserted): %s", fp)
						newCacheMutex.Lock()
						newCache[relativePath] = currentModTime
						newCacheMutex.Unlock()
					}
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
				deleteErr := m.DeleteDocument(fullPath, root)
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
		log.Printf("encountered %d errors during sync: %s", len(allErrors), strings.Join(allErrors, "; "))
		return int(indexedCount), fmt.Errorf("encountered %d errors during indexing: %s", len(allErrors), strings.Join(allErrors, "; "))
	}

	// Save the updated cache
	err = SaveModTimeCache(root, newCache)
	if err != nil {
		return int(indexedCount), fmt.Errorf("failed to save modification time cache: %v", err)
	}

	return int(indexedCount), nil
}

func (m *Meilisearch) WaitForMeilisearchStartup(healthURI string) error {
	maxRetries := 100
	retryInterval := 1 * time.Second
	log.Print(healthURI)

	for i := 0; i < maxRetries; i++ {
		resp, err := m.Client.Health()
		if err == nil && resp.Status == "available" {
			log.Printf("Meilisearch is healthy and available")
			return nil
		}

		log.Printf("Waiting for Meilisearch to start... (attempt %d/%d)", i+1, maxRetries)
		time.Sleep(retryInterval)
	}

	return fmt.Errorf("Meilisearch did not become healthy after %d attempts", maxRetries)
}

func (m *Meilisearch) UpdateDocuments(indexUID string, documents []MeiliDocument) error {
	client := meilisearch.New(meiliHost, meilisearch.WithAPIKey(meiliMasterKey))

	index := client.Index(indexUID)

	log.Printf("Sending %d documents to Meilisearch index %s", len(documents), indexUID)

	task, err := index.UpdateDocuments(documents, nil)
	if err != nil {
		log.Printf("Failed to add documents: %v", err)
		return fmt.Errorf("failed to add documents: %w", err)
	}

	log.Printf("Meilisearch task UID: %d", task.TaskUID)

	completedTask, err := client.WaitForTask(task.TaskUID, 1000)
	if err != nil {
		log.Printf("Failed to wait for task %d: %v", task.TaskUID, err)
		return fmt.Errorf("failed to wait for task %d: %w", task.TaskUID, err)
	}

	if completedTask.Status == "failed" {
		log.Printf("Meilisearch task %d failed. Error: %+v", completedTask.TaskUID, completedTask.Error)
		return fmt.Errorf("meilisearch task %d failed: %s", completedTask.TaskUID, completedTask.Error.Message)
	}

	log.Printf("Meilisearch task %d completed successfully", completedTask.TaskUID)

	return nil
}
