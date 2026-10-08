/**
 * B2 init — Bloomsight inside blooms.ai.
 *
 * Mirrors B1's `init()` with two differences:
 *
 *   • the property pre-flight is advisory (see `./property.ts`), so a
 *     misconfiguration produces a loud warning rather than a silently dead SDK
 *   • `initLocation()` is never called — blooms.ai resolves geo from the edge
 *     headers on each request, so the extra round trip buys nothing
 *
 * The platform, user and event-list helpers are shared with B1 on purpose: they
 * only read the user agent and browser storage, and they use the same storage
 * keys, so a project that migrates mid-session keeps its visitor id and its
 * already-fired event list.
 */
import {initPlatform} from '../platform/platform';
import {initUser} from '../user/user';
import {initSession} from '../session/session';
import {config, resolvePropertyToken} from '../configuration/configuration';
import {initB2Session} from './session';
import {inspectProperty} from './property';
import {debugLog} from './error';
import {resolveApiBase} from './config';

export function initB2(): void {

	initPlatform();
	initUser();
	initSession();
	initB2Session();

	debugLog(`target: blooms-ai (${resolveApiBase()})`);

	// Advisory only. Not awaited, and its result never gates anything — events
	// fired before it resolves are still sent, and the server decides.
	inspectProperty(resolvePropertyToken())
		.catch((): void => { /* inspectProperty reports its own failures */ });

	// B1 sets this from its property check. B2 has no client-side kill switch,
	// so make the state explicit rather than leaving it undefined.
	if (config) config.stopAll = false;
}

export {resolveSimpleEventB2, resolveDataEventB2} from './event';
export {isBloomsAiTarget} from './config';
export type {IBloomsightError} from './error';
