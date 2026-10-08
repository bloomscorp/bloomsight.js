import {beforeAll, beforeEach, describe, expect, test, vi} from "vitest";

/**
 * The guarantee this file exists to protect:
 *
 *   **Bumping to this version must change nothing.** A project that upgrades
 *   and redeploys without setting `target` has to keep talking to the
 *   standalone Bloomsight server (B1), with the same URLs and the same
 *   payloads. Only adding `target: 'blooms-ai'` moves it to blooms.ai (B2).
 *
 * Both halves are asserted here, because a regression in the first one breaks
 * every live customer site at once.
 *
 * The user agent is stubbed before the modules load: these tests run in headless
 * Chrome, whose UA matches the SDK's bot list, and the bot check would otherwise
 * skip every event.
 */

const REAL_UA: string =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const B1_HOST: string = 'footprint-api.bloomscorp.com';
const B2_DEFAULT_HOST: string = 'z.bloomscorp.com';
const TOKEN: string = '65d72f0b5e990c6028790156';
const EVENT_TOKEN: string = '65d735b122354c8ba6a489c2';

interface ICapturedCall {
	url: string;
	method: string;
	body: any;
	keepalive?: boolean;
}

let calls: ICapturedCall[] = [];
let respondWith: (url: string) => {status: number; body: unknown};

let sdk: typeof import('../../src/index');
let mapper: typeof import('../../src/support/request-mapper');
let resetErrorDedupe: () => void;

beforeAll(async (): Promise<void> => {
	Object.defineProperty(window.navigator, 'userAgent', {value: REAL_UA, configurable: true});

	window.fetch = vi.fn(async (input: any, init: any = {}): Promise<Response> => {
		const url: string = String(input);
		calls.push({
			url,
			method: init.method || 'GET',
			body: init.body ? JSON.parse(init.body) : undefined,
			keepalive: init.keepalive,
		});
		const {status, body} = respondWith(url);
		return new Response(JSON.stringify(body), {
			status,
			headers: {'Content-Type': 'application/json'},
		});
	}) as any;

	sdk = await import('../../src/index');
	mapper = await import('../../src/support/request-mapper');
	({resetErrorDedupe} = await import('../../src/b2/error'));
});

beforeEach((): void => {
	calls = [];
	localStorage.clear();
	sessionStorage.clear();
	resetErrorDedupe();

	// B1 compares the property name against `window.location.host`, which
	// includes the port — so the mock must echo `host`, not `hostname`, or B1
	// sets `stopAll = true` and sends nothing. (A real property is stored as a
	// bare hostname, which is why B1 breaks on any non-443 port; B2 strips the
	// port before comparing, and only warns rather than stopping.)
	respondWith = (): {status: number; body: unknown} => ({
		status: 200,
		body: {
			success: true,
			message: 'ok',
			property: {name: window.location.host, _id: TOKEN, verified: true, status: 'active'},
			data: {name: window.location.host, _id: TOKEN, token: TOKEN, verified: true, status: 'active'},
		},
	});
});

const eventCalls = (): ICapturedCall[] => calls.filter(c => c.method === 'POST');
const flush = (): Promise<void> => new Promise(r => setTimeout(r, 60));

// ── default: B1, untouched ────────────────────────────────────────────────────

describe('with no target set, everything goes to B1', (): void => {

	test('the init pre-flight hits the B1 host', async (): Promise<void> => {
		sdk.init({propertyToken: TOKEN, isDevelopmentMode: false});
		await flush();

		expect(calls.length).toBeGreaterThan(0);
		expect(calls[0]!.url).toContain(B1_HOST);
		expect(calls[0]!.url).toContain('/api/v1/property/get/');
		expect(calls[0]!.url).not.toContain(B2_DEFAULT_HOST);
	});

	test('a simple event posts to the B1 endpoint with the B1 payload', async (): Promise<void> => {
		sdk.init({propertyToken: TOKEN, isDevelopmentMode: false});
		await flush();
		calls = [];

		sdk.resolveSimpleEvent(EVENT_TOKEN);
		await flush();

		const [post] = eventCalls();
		expect(post).toBeDefined();
		expect(post!.url).toBe(`https://${B1_HOST}/api/v1/simple-event-data/add`);
		// B1's field names, not B2's.
		expect(post!.body.simpleEventToken).toBe(EVENT_TOKEN);
		expect(post!.body.eventToken).toBeUndefined();
		expect(post!.body.occurredAt).toBeUndefined();
		expect(post!.body.sessionId).toBeUndefined();
		// B1 sends geo resolved in the browser.
		expect(post!.body).toHaveProperty('ipAddress');
		expect(post!.body).toHaveProperty('city');
	});

	test('a data event posts to the B1 endpoint with eventLogData', async (): Promise<void> => {
		sdk.init({propertyToken: TOKEN, isDevelopmentMode: false});
		await flush();
		calls = [];

		sdk.resolveDataEvent(EVENT_TOKEN, {plan: 'pro'});
		await flush();

		const [post] = eventCalls();
		expect(post!.url).toBe(`https://${B1_HOST}/api/v1/data-event-data/add`);
		expect(post!.body.dataEventToken).toBe(EVENT_TOKEN);
		expect(post!.body.eventLogData).toEqual({plan: 'pro'});
		expect(post!.body.data).toBeUndefined();
	});

	test('email endpoints still point at B1', (): void => {
		expect(mapper.GMAIL_EMAIL_TRANSFER_API).toContain(B1_HOST);
		expect(mapper.SMTP_EMAIL_TRANSFER_API).toContain(B1_HOST);
	});
});

// ── target: 'blooms-ai' ───────────────────────────────────────────────────────

describe("with target 'blooms-ai', events go to B2", (): void => {

	const b2 = (extra: Record<string, unknown> = {}) =>
		sdk.init({propertyToken: TOKEN, isDevelopmentMode: false, target: 'blooms-ai', ...extra} as any);

	test('the init pre-flight hits the native B2 property endpoint', async (): Promise<void> => {
		b2();
		await flush();

		expect(calls[0]!.url).toBe(`https://${B2_DEFAULT_HOST}/api/bloomsight/ingest/property/${TOKEN}`);
		expect(calls[0]!.url).not.toContain(B1_HOST);
	});

	test('a simple event posts to the native ingest endpoint', async (): Promise<void> => {
		b2();
		await flush();
		calls = [];

		sdk.resolveSimpleEvent(EVENT_TOKEN);
		await flush();

		const [post] = eventCalls();
		expect(post!.url).toBe(`https://${B2_DEFAULT_HOST}/api/bloomsight/ingest/event`);
		expect(post!.url).not.toContain('/api/v1/');      // not the shim
	});

	test('the B2 payload carries occurredAt and sessionId', async (): Promise<void> => {
		b2();
		await flush();
		calls = [];

		sdk.resolveSimpleEvent(EVENT_TOKEN);
		await flush();

		const body = eventCalls()[0]!.body;
		expect(body.eventToken).toBe(EVENT_TOKEN);
		expect(body.property).toBe(TOKEN);
		expect(typeof body.occurredAt).toBe('string');
		expect(Number.isNaN(Date.parse(body.occurredAt))).toBe(false);
		expect(typeof body.sessionId).toBe('string');
		expect(body.sessionId.length).toBeGreaterThan(0);
	});

	test('the B2 payload omits geo, so the server derives it from edge headers', async (): Promise<void> => {
		b2();
		await flush();
		calls = [];

		sdk.resolveSimpleEvent(EVENT_TOKEN);
		await flush();

		const body = eventCalls()[0]!.body;
		expect(body.ipAddress).toBeUndefined();
		expect(body.city).toBeUndefined();
		expect(body.region).toBeUndefined();
		expect(body.countryCode).toBeUndefined();
	});

	test('B2 never calls the B1 location service', async (): Promise<void> => {
		b2();
		await flush();
		sdk.resolveSimpleEvent(EVENT_TOKEN);
		await flush();

		expect(calls.some(c => c.url.includes('get-my-ip'))).toBe(false);
	});

	test('a data event sends `data`, not `eventLogData`', async (): Promise<void> => {
		b2();
		await flush();
		calls = [];

		sdk.resolveDataEvent(EVENT_TOKEN, {plan: 'pro'});
		await flush();

		const body = eventCalls()[0]!.body;
		expect(body.data).toEqual({plan: 'pro'});
		expect(body.eventLogData).toBeUndefined();
		expect(body.dataEventToken).toBeUndefined();
	});

	test('beacons are sent with keepalive so they survive page unload', async (): Promise<void> => {
		b2();
		await flush();
		calls = [];

		sdk.resolveSimpleEvent(EVENT_TOKEN);
		await flush();

		expect(eventCalls()[0]!.keepalive).toBe(true);
	});

	test('apiBase overrides the default host', async (): Promise<void> => {
		b2({apiBase: 'https://staging.example.test/'});
		await flush();
		calls = [];

		sdk.resolveSimpleEvent(EVENT_TOKEN);
		await flush();

		// Trailing slash normalised away rather than producing a double slash.
		expect(eventCalls()[0]!.url).toBe('https://staging.example.test/api/bloomsight/ingest/event');
	});

	test('pageViewObserver is a no-op, not an error', async (): Promise<void> => {
		b2();
		await flush();
		calls = [];

		expect((): void => sdk.pageViewObserver()).not.toThrow();
		// B1 waits 2s before its page-view fetch; wait past it.
		await new Promise(r => setTimeout(r, 2300));
		expect(calls.length).toBe(0);
	}, 10000);

	test('email still goes to B1 even with the flag on', (): void => {
		b2();
		expect(mapper.GMAIL_EMAIL_TRANSFER_API).toContain(B1_HOST);
		expect(mapper.SMTP_EMAIL_TRANSFER_API).toContain(B1_HOST);
	});
});

// ── failures are visible ──────────────────────────────────────────────────────

describe('B2 surfaces failures instead of swallowing them', (): void => {

	test("onError receives the server's own code and message", async (): Promise<void> => {
		const seen: any[] = [];

		respondWith = (url: string) => url.includes('/ingest/event')
			? {status: 403, body: {success: false, message: "Origin 'x.test' is not allowed", code: 'ORIGIN_REJECTED'}}
			: {status: 200, body: {success: true, data: {name: window.location.host, _id: TOKEN, verified: true, status: 'active'}}};

		sdk.init({
			propertyToken: TOKEN, isDevelopmentMode: false, target: 'blooms-ai',
			onError: (e: any) => seen.push(e),
		} as any);
		await flush();

		sdk.resolveSimpleEvent(EVENT_TOKEN);
		await flush();

		const rejection = seen.find(e => e.code === 'ORIGIN_REJECTED');
		expect(rejection).toBeDefined();
		expect(rejection.status).toBe(403);
		expect(rejection.message).toContain('not allowed');
		expect(rejection.eventToken).toBe(EVENT_TOKEN);
	});

	test('a non-JSON response is reported rather than thrown', async (): Promise<void> => {
		const seen: any[] = [];
		window.fetch = vi.fn(async (): Promise<Response> =>
			new Response('<html>502 Bad Gateway</html>', {status: 502, headers: {'Content-Type': 'text/html'}})) as any;

		sdk.init({
			propertyToken: TOKEN, isDevelopmentMode: false, target: 'blooms-ai',
			onError: (e: any) => seen.push(e),
		} as any);
		await flush();

		expect(seen.some(e => e.code === 'BAD_RESPONSE')).toBe(true);
	});

	test('a throwing onError handler cannot break the page', async (): Promise<void> => {
		window.fetch = vi.fn(async (): Promise<Response> => {
			throw new Error('offline');
		}) as any;

		expect((): void => sdk.init({
			propertyToken: TOKEN, isDevelopmentMode: false, target: 'blooms-ai',
			onError: (): void => { throw new Error('handler blew up'); },
		} as any)).not.toThrow();

		await flush();
	});
});
