// loadFiles.ts
import { readDir } from '@tauri-apps/plugin-fs'
import { FileNode } from './Files'

function parseFilePath(path: string) {
    path = path.replaceAll("//", "/").replaceAll("\\\\", "\\")
    const pathParts = path.replace(/\\/g, "/").split("/")
    const filename = pathParts.pop()!
    const directory = pathParts.join("/") || "/"
    const extension = filename.includes(".") ? filename.split(".").pop()! : ""
    const baseName = extension ? filename.slice(0, -extension.length - 1) : filename

    return {
        name: baseName,
        filename,
        isSelectable: true,
        dir: false,
        directory,
        extension,
        path
    }
}

export async function loadFilesFromDisk(base: string): Promise<{ tree: FileNode[], raw: File[] }> {
    const files: { tree: FileNode[], raw: File[] } = { tree: [], raw: [] }
    let fileRoot = await readDir(base)

    fileRoot = fileRoot.filter(e => !e.name.startsWith("."))
    fileRoot.sort((a, b) => a.isDirectory && b.isFile ? -1 : 1)

    for (let entry of fileRoot) {
        files.tree.push(await expand(entry, base))
    }
    return files

    async function expand(entry: any, base: string): Promise<FileNode> {
        const path = `${base}/${entry.name}`
        const raw = parseFilePath(path)

        if (entry.isDirectory) raw.dir = true
        if (entry.isSymlink) raw.link = true
        if (entry.isFile) raw.file = true

        files.raw.push(raw)

        if (raw.dir) {
            let childrenEntries = await readDir(path)
            childrenEntries = childrenEntries.filter(e => !e.name.startsWith("."))
            childrenEntries.sort((a, b) => a.isDirectory && b.isFile ? -1 : 1)

            const children = await Promise.all(childrenEntries.map(e => expand(e, path)))
            return { path, children }
        }

        return { path }
    }
}