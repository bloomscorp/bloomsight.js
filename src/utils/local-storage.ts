export function store(key: string, value: string): void {
	localStorage.setItem(key, value);
}

export function retrieve(key: string): string {
	const value: string | null = localStorage.getItem(key);
	return (value === null) ? '' : value;
}

export function clear(): void {
	localStorage.clear();
}
