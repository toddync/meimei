import { join, dirname, basename, extname } from '@tauri-apps/api/path'
import { readDir } from '@tauri-apps/plugin-fs'

export interface TreeItem {
    index?: number
    canMove?: boolean
    canRename?: boolean
    canDelete?: boolean
    isFolder: boolean
    children?: string[]
    data?: any
    parentId?: string
    extension?: string
}

export interface TreeData {
    rootId: string
    items: Record<string, TreeItem>
}

async function parseFilePath(path: string) {
    //@ts-ignore
    path = path.replaceAll("//", "/").replaceAll("\\\\", "\\")
    const directory = await dirname(path)
    let extension = "";
    try {
        extension = await extname(path);
    } catch (error) {

    }
    const filename = await basename(path)
    const baseName = filename.replace(`.${extension}`, "")
    return {
        name: baseName,
        filename,
        dir: false,
        directory,
        extension,
        path
    }
}

export default async function loadFilesForReactComplexTree(base: string): Promise<TreeData> {
    const treeData: TreeData = {
        rootId: base,
        items: {
            [base]: {
                isFolder: true,
                children: [],
                data: { path: base },
                canMove: true,
                canRename: true,
                canDelete: false,
            }
        }
    }

    async function expand(entry: any, parentPath: string): Promise<void> {
        const path = await join(parentPath, entry.name)
        const raw = await parseFilePath(path)

        const id = path
        const parentId = parentPath

        const isFolder = entry.isDirectory
        // const isFile = entry.isFile

        treeData.items[id] = {
            isFolder,
            children: isFolder ? [] : undefined,
            data: raw,
            parentId,
            canMove: true,
            canRename: true,
            canDelete: true,
            extension: raw.extension
        }

        if (treeData.items[parentId]?.children) {
            treeData.items[parentId].children!.push(id)
        }

        if (isFolder) {
            let childrenEntries = await readDir(path)
            childrenEntries = childrenEntries.filter(e => !e.name.startsWith("."))
            childrenEntries.sort((a, b) => a.isDirectory && b.isFile ? -1 : 1)

            for (const child of childrenEntries) {
                await expand(child, path)
            }
        }
    }

    const rootEntries = await readDir(base)
    const filteredEntries = rootEntries.filter(e => !e.name.startsWith("."))
    const sortedEntries = filteredEntries.sort((a, b) => a.isDirectory && b.isFile ? -1 : 1)

    for (const entry of sortedEntries) {
        await expand(entry, base)
    }

    return treeData
}
