export function generateUserId(): string {
	return (Date.now() + Math.random()).toString(36);
}
