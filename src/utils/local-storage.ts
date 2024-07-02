import {isBrowser} from "./browser-api";

export function storeInLocalStore(key: string, value: string): void {
	if (!isBrowser()) return;
	localStorage.setItem(key, value);
}

export function retrieveFromLocalStore(key: string): string {
	if (!isBrowser()) return '';

	const value: string | null = localStorage.getItem(key);
	return (value === null) ? '' : value;
}

export function hasKeyInLocalStore(key: string): boolean {
	if (!isBrowser()) return false;

	const value: string | null = localStorage.getItem(key);
	return value !== null;
}

export function clearLocalStore(): void {
	if (!isBrowser()) return;
	localStorage.clear();
}
