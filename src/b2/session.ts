/**
 * B2 session id.
 *
 * B1 only ever had an `isNewSession` boolean, so two visits from one person
 * could not be told apart after the fact. blooms.ai stores a real `sessionId`
 * on every row, so B2 generates and carries one.
 *
 * It lives in `sessionStorage`, which is exactly the lifetime wanted: per tab,
 * cleared when the tab closes. B1's own 30-minute session bookkeeping is left
 * alone — this is additive and does not touch it.
 */
import {retrieveFromSessionStore, storeInSessionStore} from '../utils/session-storage';

const B2_SESSION_ID_KEY: string = 'bs2-session-id';

let activeSessionId: string = '';

function generateSessionId(): string {
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function initB2Session(): void {
	const stored: string = retrieveFromSessionStore(B2_SESSION_ID_KEY);

	if (stored) {
		activeSessionId = stored;
		return;
	}

	activeSessionId = generateSessionId();
	storeInSessionStore(B2_SESSION_ID_KEY, activeSessionId);
}

export function resolveSessionId(): string {
	if (activeSessionId) return activeSessionId;

	// `init()` is normally what creates it, but an event fired before init
	// finished should still carry a stable id rather than an empty one.
	const stored: string = retrieveFromSessionStore(B2_SESSION_ID_KEY);
	if (stored) {
		activeSessionId = stored;
		return activeSessionId;
	}

	initB2Session();
	return activeSessionId;
}
