//@ts-nocheck
import { readDir } from "@tauri-apps/plugin-fs";
import { writable } from "svelte/store";

export let Root = writable("");
export let Files = writable({ tree: [], raw: [] });

export async function loadFiles(base) {
	let files = { tree: [], raw: [] };
	let fileRoot = await readDir(base);

	fileRoot = fileRoot.filter((entry) => entry.name[0] != ".");
	fileRoot.sort((a, b) => {
		if (a.isDirectory && b.isFile) return false;
		return true;
	});

	for (let i = 0; i < fileRoot.length; i++) {
		files.tree.push(await expand(fileRoot[i], base));
	}
	console.log(files);
	return files;

	async function expand(entry, base) {
		let path = `${base}/${entry.name}`;
		let raw = parseFilePath(path);

		if (entry.isDirectory) raw.dir = true;
		if (entry.isSymlink) raw.link = true;
		if (entry.isFile) raw.file = true;
		files.raw.push(raw);

		if (raw.dir) {
			let fileRoot = await readDir(path);

			fileRoot = fileRoot.filter((entry) => entry.name[0] != ".");
			fileRoot.sort((a, b) => {
				if (a.isDirectory && b.isFile) return false;
				return true;
			});

			let contents = [];

			for (let i = 0; i < fileRoot.length; i++) {
				contents.push(await expand(fileRoot[i], path));
			}

			return {
				...raw,
				contents,
				expanded: false,
			};
		} else {
			return raw;
		}
	}
}

function parseFilePath(path) {
	path = path.replaceAll("//", "/").replaceAll("\\\\", "\\");
	const pathParts = path.replace(/\\/g, "/").split("/"); // Normalize separators
	const filename = pathParts.pop();
	const directory = pathParts.join("/") || "/";
	const extension = filename.includes(".") ? filename.split(".").pop() : "";
	const baseName = extension
		? filename.slice(0, -extension.length - 1)
		: filename;

	return {
		directory,
		filename,
		extension,
		baseName,
		path,
	};
}
