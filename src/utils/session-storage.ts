import {isBrowser} from "./browser-api";
import {hasKeyInLocalStore} from "./local-storage";

export function storeInSessionStore(key: string, value: string): void {
	if (!isBrowser()) return;
	sessionStorage.setItem(key, value);
}

export function retrieveFromSessionStore(key: string): string {
	if (!isBrowser()) return '';

	const value: string | null = sessionStorage.getItem(key);
	return (value === null) ? '' : value;
}

export function hasKeyInSessionStore(key: string): boolean {
	if (!isBrowser()) return false;

	const value: string | null = sessionStorage.getItem(key);
	return value !== null;
}

export function removeKeyFromSessionStore(key: string) {
	if (!isBrowser()) return;
	if (!hasKeyInLocalStore(key)) return;

	sessionStorage.removeItem(key);
}

export function clearSessionStore(): void {
	if (!isBrowser()) return;
	sessionStorage.clear();
}
