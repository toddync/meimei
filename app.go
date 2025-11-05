package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"os"
	"path/filepath"

	"github.com/meilisearch/meilisearch-go"
)

// App struct
type App struct {
	ctx       context.Context
	typesense *Typesense
	meili     *Meilisearch
	port      int
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		typesense: NewTypesense(),
		meili:     NewMeilisearch("http://localhost:7700"), // Temporary hardcoded host, will be updated dynamically
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Get platform-agnostic configuration directory
	configDir, err := getConfigDir()
	if err != nil {
		log.Fatalf("Failed to get config directory: %v", err)
	}

	// Find an available port
	// port, err := findAvailablePort()
	// if err != nil {
	// 	log.Fatalf("Failed to find an available port: %v", err)
	// }

	port := 7700 // Temporary hardcoded port for Meilisearch

	a.port = port

	meilisearchBinaryPath := "./meilisearch/meilisearch"
	err = a.meili.StartMeilisearch(meilisearchBinaryPath, configDir, port)
	if err != nil {
		log.Fatalf("Failed to start Meilisearch: %v", err)
	}

	// Update Meilisearch client with the dynamically assigned port
	a.meili.Client = NewMeilisearch(fmt.Sprintf("http://localhost:%d", port)).Client

	// sleep for a few seconds to allow Meilisearch to start
	log.Printf("Waiting for Meilisearch to start...")
	err = a.meili.WaitForMeilisearchStartup(fmt.Sprintf("http://localhost:%d/health", port))
	if err != nil {
		log.Fatalf("Meilisearch did not start in time: %v", err)
	}

	if _, err = a.meili.Client.CreateIndex(&meilisearch.IndexConfig{
		Uid:        "documents",
		PrimaryKey: "id",
	}); err != nil {
		log.Fatalf("Failed to create Meilisearch index: %v", err)
	}
}

func (a *App) GetPort() int {
	return a.port
}

// Functions to interact with Typesense
func (a *App) CreateTypesenseCollection() string {
	err := a.typesense.CreateCollection()
	if err != nil {
		return fmt.Sprintf("Error creating collection: %s", err.Error())
	}
	return "Collection created or already exists"
}

func (a *App) IndexFolder(root string) string {
	batchSize := 50 // You can adjust the batch size as needed
	count, err := a.meili.IndexFolder(root, batchSize)
	if err != nil {
		return fmt.Sprintf("Error indexing documents: %s", err.Error())
	}

	return fmt.Sprintf("Indexed %d documents", count)
}

func (a *App) startSyncAndWatch(root string) {
	log.Printf("Starting initial sync for folder: %s", root)
	count, err := a.typesense.SyncFolder(root)
	if err != nil {
		log.Printf("Error during initial sync of folder %s: %v", root, err)
	} else {
		log.Printf("Initial sync completed. Indexed/updated %d documents in %s", count, root)
	}

	log.Printf("Starting folder watcher for: %s", root)
	err = a.typesense.WatchFolderAndSync(root, a.ctx)
	if err != nil {
		log.Fatalf("Error starting folder watcher for %s: %v", root, err)
	}
}

// getConfigDir returns a platform-agnostic configuration directory for the application.
// It creates the directory if it doesn't exist.
func getConfigDir() (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", fmt.Errorf("failed to get user config directory: %w", err)
	}

	meimeiConfigDir := filepath.Join(configDir, "meimei")

	// Create the directory if it doesn't exist
	if err := os.MkdirAll(meimeiConfigDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create meimei config directory: %w", err)
	}

	return meimeiConfigDir, nil
}

// findAvailablePort finds a random available port on the system.
func findAvailablePort() (int, error) {
	addr, err := net.ResolveTCPAddr("tcp", "localhost:0")
	if err != nil {
		return 0, err
	}

	l, err := net.ListenTCP("tcp", addr)
	if err != nil {
		return 0, err
	}
	defer l.Close()
	return l.Addr().(*net.TCPAddr).Port, nil
}
