/**
 * B2 property pre-flight.
 *
 * **Advisory, not a gate.** This is the one behavioural change worth calling
 * out: B1 hard-stops the entire SDK when its property lookup does not match
 * (`config.stopAll = true`), so a single configuration mistake silently
 * disables all tracking on the site and leaves nothing to debug with.
 *
 * B2 does not do that. The server authenticates every single beacon against the
 * property's allowed origins anyway, so it — not the browser — is the authority
 * on whether a request is legitimate. All this does is warn loudly and early,
 * which is strictly more useful than failing closed on information the client
 * cannot be trusted about in the first place.
 */
import {resolveHost} from '../utils/browser-api';
import {getPropertyApi, jsonHeaders} from './request-mapper';
import {getJson, IB2Result} from './transmission';
import {debugLog, reportError} from './error';

export interface IB2PropertyMetadata {
	_id: string;
	token: string;
	name: string;
	verified: boolean;
	status: 'active' | 'paused';
}

/** Hostname only — `resolveHost()` includes the port, a property never does. */
function bareHost(value: string): string {
	const withoutPort: string = String(value || '').toLowerCase().split(':')[0] ?? '';
	return withoutPort.replace(/^www\./, '');
}

/**
 * Resolves once the check has run. Never rejects, and never prevents events
 * from being sent.
 */
export async function inspectProperty(propertyToken: string): Promise<IB2PropertyMetadata | null> {

	const result: IB2Result<IB2PropertyMetadata> =
		await getJson<IB2PropertyMetadata>(getPropertyApi(propertyToken), jsonHeaders());

	// A failure here has already been reported by the transport layer.
	const property: IB2PropertyMetadata | undefined = result.body?.data;
	if (!result.ok || !property) return null;

	const expected: string = bareHost(property.name);
	const actual: string = bareHost(resolveHost());

	// Subdomains are legitimate — the server accepts them — so this only warns
	// when the page is on an unrelated host entirely.
	const hostMatches: boolean = actual === expected || actual.endsWith(`.${expected}`);

	if (!hostMatches) {
		reportError({
			code: 'PROPERTY_HOST_MISMATCH',
			message: `this property is registered for '${property.name}' but the page is on '${actual}'. `
				+ `Events will be rejected unless '${actual}' is added to the website's allowed origins.`,
		});
	}

	if (property.status !== 'active') {
		reportError({
			code: 'PROPERTY_PAUSED',
			message: `website '${property.name}' is paused in blooms.ai, so events will not be stored.`,
		});
	}

	if (!property.verified) {
		debugLog(`website '${property.name}' is not verified yet; ingest still works, but new events cannot be defined.`);
	}

	debugLog('property', property);

	return property;
}
