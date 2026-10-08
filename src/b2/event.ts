/**
 * B2 events.
 *
 * Same two public calls as B1 — `resolveSimpleEvent(token, label?)` and
 * `resolveDataEvent(token, data, label?)` — so nothing in a consumer's code or
 * in `ngx-bloomsight` changes. Only where the payload goes, and what it
 * carries, is different.
 *
 * What B2 sends that B1 does not:
 *   • `occurredAt` — the moment the event happened, so a queued or delayed
 *     beacon is no longer timestamped on arrival
 *   • `sessionId` — a real id rather than B1's `newSession` boolean
 *
 * What B2 deliberately does **not** send:
 *   • `ipAddress`, `city`, `region`, `countryCode`. blooms.ai derives all four
 *     from the edge headers on the request, which is both more accurate and one
 *     fewer round trip. This is why B2 never calls `initLocation()`.
 */
import {config, isProperConfigProvided, resolvePropertyToken} from '../configuration/configuration';
import {isDesktopModeEnabled, resolveBrowser, resolveBrowserVersion, resolveDevice, resolveOS} from '../platform/platform';
import {isBot} from '../utils/bot-handler';
import {isNewUser, resolveUserId} from '../user/user';
import {retrieveEventList, storeEventList} from '../event/event';
import {resolveSegmentUrl} from '../utils/browser-api';
import {resolveSessionId} from './session';
import {ingestEventApi, jsonHeaders} from './request-mapper';
import {postJson} from './transmission';
import {debugLog, reportError} from './error';

export interface IB2EventPayload {
	property: string;
	eventToken: string;
	userId: string;
	sessionId: string;
	occurredAt: string;
	url: string;
	browserName: string;
	browserVersion: string;
	osName: string;
	deviceType: string;
	isDesktopModeEnabled: boolean;
	newUser?: boolean;
	returningUser?: boolean;
	newSession?: boolean;
	data?: {[key: string]: unknown};
}

interface IB2IngestResult {
	accepted?: number;
	rejected?: unknown[];
	warnings?: unknown[];
	overQuota?: boolean;
}

function buildPayload(eventToken: string, data?: {[key: string]: unknown}): IB2EventPayload {

	const payload: IB2EventPayload = {
		property: resolvePropertyToken(),
		eventToken,
		userId: resolveUserId(),
		sessionId: resolveSessionId(),
		occurredAt: new Date().toISOString(),
		url: resolveSegmentUrl() || '',
		browserName: resolveBrowser(),
		browserVersion: resolveBrowserVersion(),
		osName: resolveOS(),
		deviceType: resolveDevice(),
		isDesktopModeEnabled: isDesktopModeEnabled(),
	};

	if (data !== undefined) payload.data = data;

	// First time this token has fired for this visitor — same semantics as B1,
	// same storage key, so a project that migrates mid-session keeps its history.
	const triggered: string[] = retrieveEventList() || [];

	if (!triggered.includes(eventToken)) {
		if (isNewUser) payload.newUser = true;
		else payload.returningUser = true;

		payload.newSession = true;
		storeEventList([...triggered, eventToken]);
	}

	return payload;
}

/**
 * Returns false when the event was not sent, so both public entry points share
 * one set of guards.
 */
function shouldSend(eventToken: string, disabledFlag: boolean | undefined, what: string): boolean {

	if (!isProperConfigProvided) {
		reportError({
			code: 'NOT_CONFIGURED',
			message: 'propertyToken and isDevelopmentMode are mandatory parameters',
			eventToken,
		});
		return false;
	}

	if (!eventToken) {
		reportError({code: 'MISSING_EVENT_TOKEN', message: `${what} called without an event token`});
		return false;
	}

	// B1 latches this: `if (isBot()) config.stopAll = true`, which disables
	// everything permanently for the rest of the page. B2 skips the individual
	// event instead and leaves configuration alone.
	if (isBot()) {
		debugLog(`skipping ${what} — the user agent looks like a bot`);
		return false;
	}

	if (config?.stopAll || disabledFlag) {
		debugLog(`skipping ${what} — tracking is disabled by configuration`);
		return false;
	}

	if (config?.logOnly) {
		debugLog(`logOnly: would have sent ${what}`, eventToken);
		return false;
	}

	return true;
}

function send(payload: IB2EventPayload): void {

	debugLog('event payload', payload);

	postJson<IB2IngestResult>(ingestEventApi(), payload, jsonHeaders(), {eventToken: payload.eventToken})
		.then((result): void => {
			if (!result.ok) return;   // already reported by the transport

			const data: IB2IngestResult | undefined = result.body?.data;

			// The server accepts a payload whose metadata contains keys the event
			// never declared, and tells us about them rather than failing. Worth
			// surfacing: it almost always means a typo in a key name.
			if (data?.warnings?.length) {
				debugLog('ingest warnings', data.warnings);
			}

			if (data?.overQuota) {
				debugLog('this project is over its monthly event allowance; events are still being collected');
			}

			debugLog(`event ${payload.eventToken} accepted`);
		});
}

export function resolveSimpleEventB2(eventToken: string, _label: string = ''): void {
	if (!shouldSend(eventToken, config?.stopSimpleEvent, 'simple event')) return;
	send(buildPayload(eventToken));
}

export function resolveDataEventB2(
	eventToken: string,
	eventData: {[key: string]: unknown},
	_label: string = ''
): void {
	if (!shouldSend(eventToken, config?.stopDataEvent, 'data event')) return;
	send(buildPayload(eventToken, eventData || {}));
}
