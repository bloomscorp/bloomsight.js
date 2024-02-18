export function store(key: string, value: string): void {
	sessionStorage.setItem(key, value);
}

export function retrieve(key: string): string {
	const value: string | null = sessionStorage.getItem(key);
	return (value === null) ? '' : value;
}

export function clear(): void {
	sessionStorage.clear();
}
