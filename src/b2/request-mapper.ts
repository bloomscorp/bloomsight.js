/**
 * B2 endpoints — Bloomsight running inside blooms.ai.
 *
 * Kept entirely separate from `src/support/request-mapper.ts`, which is B1 and
 * must not be touched: a project that bumps to this version without setting
 * `target` has to behave exactly as it did before.
 *
 * These are the *native* blooms.ai endpoints, not the `/api/v1` compatibility
 * shim. The shim exists for sites that never bump the library; a project that
 * has bumped should get the better surface — `occurredAt`, `sessionId`,
 * batching and real error codes.
 *
 * Unlike B1 these are functions, not constants. B1's constants are evaluated at
 * module load, which happens before `init()` runs, so they could never read
 * configuration.
 */
import {resolveApiBase} from './config';

export const DEFAULT_B2_API_BASE: string = 'https://z.bloomscorp.com';

/** POST a single event, or a batch of up to 100. */
export function ingestEventApi(): string {
	return `${resolveApiBase()}/api/bloomsight/ingest/event`;
}

/** GET the property's public metadata — the init-time pre-flight. */
export function getPropertyApi(propertyToken: string): string {
	return `${resolveApiBase()}/api/bloomsight/ingest/property/${encodeURIComponent(propertyToken)}`;
}

export function jsonHeaders(): Record<string, string> {
	return {'Content-Type': 'application/json'};
}
