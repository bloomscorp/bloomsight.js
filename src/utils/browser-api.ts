export function isBrowser(): boolean {
	return typeof window !== 'undefined' && typeof document !== 'undefined';
}

// Window
export function resolveWindow(): Window {
	return isBrowser() ? window : {} as Window;
}

export function resolveHost(): string {
	return isBrowser() ? window.location.host : '';
}

export function resolveActiveUrl(): string {
	return isBrowser() ? window.location.href : '';
}

export function resolveSegmentUrl(): string {
	return isBrowser() ? window.location.pathname : '';
}

export function resolveUserAgent(): string {
	return isBrowser() ? window.navigator.userAgent : '';
}

// Document
export function resolveDocument(): Document {
	return isBrowser() ? document : {} as Document;
}

export function resolveDocumentReferrer() : string {
	return isBrowser() ? document.referrer : '';
}

export function resolveDocumentTitle(): string {
	return isBrowser() ? document.title : '';
}
