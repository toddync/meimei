package main

import (
	"log"
	"os"
)

func (a *App) GetFileContent(path string) string {
	data, err := os.ReadFile(path)
	if err != nil {
		log.Printf("Failed to read file %s: %v", path, err)
		return ""
	}
	return string(data)
}

func (a *App) SaveFileContent(path string, content string) error {
	err := os.WriteFile(path, []byte(content), 0644)
	if err != nil {
		log.Printf("Failed to write file %s: %v", path, err)
		return err
	}
	return nil
}
