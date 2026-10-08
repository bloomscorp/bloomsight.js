/**
 * B2 error reporting.
 *
 * B1 swallows every failure into a `console.log` that only appears in
 * development mode, so a misconfigured site looks exactly like a working one:
 * the page behaves normally, and no data arrives. That is the single hardest
 * thing to debug during a migration, so B2 does the opposite.
 *
 * Three levels, deliberately:
 *   • `onError` is always called, so a project can wire its own monitoring
 *   • in debug mode everything is logged in full
 *   • otherwise each distinct failure code is warned about **once** per page, so
 *     a broken cutover is visible in the console without flooding it
 */
import {config} from '../configuration/configuration';
import {isDebugEnabled} from './config';

export interface IBloomsightError {
	/** Machine-readable. Server codes (`ORIGIN_REJECTED`, `UNKNOWN_PROPERTY`,
	 *  `EVENT_PROPERTY_MISMATCH`, `EVENT_ARCHIVED`, …) pass through unchanged. */
	code: string;
	message: string;
	/** HTTP status, when the failure came from a response. */
	status?: number;
	/** The event token involved, when there was one. */
	eventToken?: string;
}

const warnedCodes: Set<string> = new Set<string>();

export function reportError(error: IBloomsightError): void {

	if (typeof config?.onError === 'function') {
		// A throwing handler must never break the host page.
		try {
			config.onError(error);
		} catch {
			/* ignored on purpose */
		}
	}

	if (isDebugEnabled()) {
		console.error('bloomsight.js [blooms-ai]:', error);
		return;
	}

	if (!warnedCodes.has(error.code)) {
		warnedCodes.add(error.code);
		console.warn(`bloomsight.js [blooms-ai]: ${error.code} — ${error.message}`);
	}
}

export function debugLog(...parts: unknown[]): void {
	if (isDebugEnabled()) console.log('bloomsight.js [blooms-ai]:', ...parts);
}

/** Test seam — the dedupe set is module state and would leak between cases. */
export function resetErrorDedupe(): void {
	warnedCodes.clear();
}
