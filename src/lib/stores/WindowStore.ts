import type { Window } from "@tauri-apps/api/window";
import { writable } from "svelte/store";

export const W = writable<Window | null>(null);
