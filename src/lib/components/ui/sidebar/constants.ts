import { writable } from "svelte/store";

export const SIDEBAR_COOKIE_NAME = "sidebar:state";
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
export const SIDEBAR_WIDTH = writable("256px");
export const SIDEBAR_WIDTH_MOBILE = "288px";
export const SIDEBAR_WIDTH_ICON = "48px";
export const SIDEBAR_KEYBOARD_SHORTCUT = "/";
