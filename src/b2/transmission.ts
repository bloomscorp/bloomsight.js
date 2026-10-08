/**
 * B2 transport.
 *
 * Differences from B1's `src/transmission/transmission.ts`, all deliberate:
 *
 *   • `keepalive: true` — a beacon fired from a click that navigates away is no
 *     longer cancelled when the page unloads, which is where B1 loses events.
 *   • the server's own `message` and `code` are surfaced instead of being
 *     flattened into a generic string, so `ORIGIN_REJECTED` reads as
 *     `ORIGIN_REJECTED` rather than "resource validation error".
 *   • a non-JSON response (an nginx error page, a captive portal) is reported
 *     as such instead of throwing an unhandled parse error.
 */
import {isBrowser} from '../utils/browser-api';
import {IBloomsightError, reportError} from './error';

export interface IB2Response<T = unknown> {
	success: boolean;
	message?: string;
	code?: string;
	data?: T;
}

export interface IB2Result<T = unknown> {
	ok: boolean;
	status: number;
	body: IB2Response<T> | null;
	error?: IBloomsightError;
}

const NETWORK_FAILURE: string = 'NETWORK_FAILURE';
const BAD_RESPONSE: string = 'BAD_RESPONSE';

async function readBody<T>(response: Response): Promise<IB2Response<T> | null> {
	try {
		return await response.json() as IB2Response<T>;
	} catch {
		return null;
	}
}

/** Shared by the event POST and the property pre-flight. Never throws. */
async function request<T>(
	url: string,
	init: RequestInit,
	context: {eventToken?: string}
): Promise<IB2Result<T>> {

	if (!isBrowser()) {
		return {ok: false, status: 0, body: null};
	}

	let response: Response;

	try {
		response = await fetch(url, init);
	} catch (cause) {
		const error: IBloomsightError = {
			code: NETWORK_FAILURE,
			message: `could not reach ${url} (${(cause as Error)?.message || 'network error'})`,
			eventToken: context.eventToken,
		};
		reportError(error);
		return {ok: false, status: 0, body: null, error};
	}

	const body: IB2Response<T> | null = await readBody<T>(response);

	if (!body) {
		const error: IBloomsightError = {
			code: BAD_RESPONSE,
			message: `${url} did not return JSON (HTTP ${response.status})`,
			status: response.status,
			eventToken: context.eventToken,
		};
		reportError(error);
		return {ok: false, status: response.status, body: null, error};
	}

	if (!response.ok || !body.success) {
		const error: IBloomsightError = {
			code: body.code || `HTTP_${response.status}`,
			message: body.message || `request to ${url} failed`,
			status: response.status,
			eventToken: context.eventToken,
		};
		reportError(error);
		return {ok: false, status: response.status, body, error};
	}

	return {ok: true, status: response.status, body};
}

export function postJson<T>(
	url: string,
	payload: unknown,
	headers: Record<string, string>,
	context: {eventToken?: string} = {}
): Promise<IB2Result<T>> {
	return request<T>(url, {
		method: 'POST',
		headers,
		body: JSON.stringify(payload),
		// Survives page unload. Bodies are a couple of KB, well under the 64 KB
		// the spec allows for keepalive requests.
		keepalive: true,
	}, context);
}

export function getJson<T>(
	url: string,
	headers: Record<string, string>,
	context: {eventToken?: string} = {}
): Promise<IB2Result<T>> {
	return request<T>(url, {method: 'GET', headers}, context);
}
