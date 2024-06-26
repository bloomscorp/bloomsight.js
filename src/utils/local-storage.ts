import {isBrowser} from "./browser-api";

export function store(key: string, value: string): void {
	if (!isBrowser()) return;
	localStorage.setItem(key, value);
}

export function retrieve(key: string): string {
	if (!isBrowser()) return '';

	const value: string | null = localStorage.getItem(key);
	return (value === null) ? '' : value;
}

export function hasKey(key: string): boolean {
	if (!isBrowser()) return false;

	const value: string | null = localStorage.getItem(key);
	return value !== null;
}

export function clear(): void {
	if (!isBrowser()) return;
	localStorage.clear();
}
