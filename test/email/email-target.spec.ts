import {beforeAll, beforeEach, describe, expect, test, vi} from 'vitest';

/**
 * Email has its own switch, independent of the events `target`
 * (MIGRATION.md, "Moving email"). The guarantees:
 *
 *   • with no setting, `sendEmail` posts to the standalone server exactly as before
 *   • `configureEmail({ target: 'blooms-ai' })` moves email — without `init()`,
 *     because email-only sites never call it — and does not move events
 *   • the events `target` alone does not move email
 *
 * The "no init" cases run first, on purpose: `init`'s config is module state
 * with no reset, so once a later case calls `init()` it stays set.
 */

const REAL_UA: string =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const B1_GMAIL: string = 'https://footprint-api.bloomscorp.com/api/v1/email-notifier/gmail/send';
const B1_SMTP: string = 'https://footprint-api.bloomscorp.com/api/v1/email-notifier/smtp/send';
const B2_SEND: string = 'https://z.bloomscorp.com/api/bloomsight/email/send';
const TOKEN: string = '65d72f0b5e990c6028790156';

interface ICall { url: string; method: string; form: Record<string, string> | null; json: any; keepalive?: boolean }

let calls: ICall[] = [];
let respond: (url: string) => {status: number; body: unknown} | 'network-error';

let sdk: typeof import('../../src/index');
let resetEmailConfig: () => void;
let resetErrorDedupe: () => void;

beforeAll(async (): Promise<void> => {
	Object.defineProperty(window.navigator, 'userAgent', {value: REAL_UA, configurable: true});
	window.fetch = vi.fn(async (input: any, init: any = {}): Promise<Response> => {
		const url: string = String(input);
		const form: Record<string, string> | null = init.body instanceof FormData
			? Object.fromEntries([...(init.body as FormData).entries()].map(([k, v]) => [k, String(v)])) : null;
		calls.push({url, method: init.method || 'GET', form, json: typeof init.body === 'string' ? JSON.parse(init.body) : undefined, keepalive: init.keepalive});
		const r = respond(url);
		if (r === 'network-error') throw new TypeError('Failed to fetch');
		return new Response(JSON.stringify(r.body), {status: r.status, headers: {'Content-Type': 'application/json'}});
	}) as any;

	sdk = await import('../../src/index');
	({resetEmailConfig} = await import('../../src/email/email-config'));
	({resetErrorDedupe} = await import('../../src/b2/error'));
});

beforeEach((): void => {
	calls = [];
	resetEmailConfig();
	resetErrorDedupe();
	respond = (): {status: number; body: unknown} => ({
		status: 202,
		body: {success: true, message: 'ok', property: {name: window.location.host, _id: TOKEN}, data: {name: window.location.host}},
	});
});

const flush = (): Promise<void> => new Promise(r => setTimeout(r, 60));
const form = (): FormData => { const f = new FormData(); f.append('name', 'Asha'); f.append('email', 'asha@example.com'); return f; };
const send = (engine: 'GMAIL' | 'CUSTOM_SMTP' = 'GMAIL') => {
	const result = {ok: 0, fail: 0};
	sdk.sendEmail(engine, 'ENGINE1', 'TEMPLATE1', 'OWNER1', form(), () => { result.ok++; }, () => { result.fail++; });
	return result;
};
const emailCalls = (): ICall[] => calls.filter(c => c.form !== null);

// ── without init() — how an email-only site uses the library ──────────────────

describe('without init(), as an email-only site uses it', (): void => {

	test('by default, Gmail and SMTP go to the standalone server, as before', async (): Promise<void> => {
		send('GMAIL'); send('CUSTOM_SMTP');
		await flush();
		const [gmail, smtp] = emailCalls();
		expect(gmail!.url).toBe(B1_GMAIL);
		expect(smtp!.url).toBe(B1_SMTP);
		expect(gmail!.form).toMatchObject({engineId: 'ENGINE1', userId: 'OWNER1', templateId: 'TEMPLATE1', 'metadata[name]': 'Asha', 'metadata[email]': 'asha@example.com'});
	});

	test("configureEmail({ target: 'blooms-ai' }) moves email to blooms.ai — no init needed", async (): Promise<void> => {
		sdk.configureEmail({target: 'blooms-ai'});
		const r = send('GMAIL');
		await flush();
		const [post] = emailCalls();
		expect(post!.url).toBe(B2_SEND);
		expect(post!.method).toBe('POST');
		expect(post!.form).toMatchObject({engineId: 'ENGINE1', templateId: 'TEMPLATE1', 'metadata[name]': 'Asha', 'metadata[email]': 'asha@example.com'});
		expect(post!.form).toHaveProperty('senderInfo[url]');
		expect(post!.keepalive).toBeUndefined();
		expect(r).toEqual({ok: 1, fail: 0});
	});

	test('SMTP goes to the same blooms.ai endpoint — one pipeline there', async (): Promise<void> => {
		sdk.configureEmail({target: 'blooms-ai'});
		send('CUSTOM_SMTP');
		await flush();
		expect(emailCalls()[0]!.url).toBe(B2_SEND);
	});

	test('the window global exists for script-tag sites', (): void => {
		expect(typeof (window as any).configureEmail).toBe('function');
		expect((window as any).sendEmail).toBe(sdk.sendEmail);
	});

	test('apiBase points email elsewhere; a trailing slash is fine', async (): Promise<void> => {
		sdk.configureEmail({target: 'blooms-ai', apiBase: 'https://staging.example.test/'});
		send();
		await flush();
		expect(emailCalls()[0]!.url).toBe('https://staging.example.test/api/bloomsight/email/send');
	});

	test("a rejected send calls onError, and the setting's handler gets the server's code", async (): Promise<void> => {
		const seen: any[] = [];
		sdk.configureEmail({target: 'blooms-ai', onError: e => seen.push(e)});
		respond = () => ({status: 404, body: {success: false, code: 'TEMPLATE_NOT_FOUND', message: 'Template not found'}});
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const r = send();
		await flush();
		expect(r).toEqual({ok: 0, fail: 1});
		expect(seen[0]).toMatchObject({code: 'TEMPLATE_NOT_FOUND', status: 404});
		expect(warn).toHaveBeenCalledTimes(1);
		send();
		await flush();
		expect(warn).toHaveBeenCalledTimes(1);   // once per code, not per send
		warn.mockRestore();
	});

	test('a 2xx without success: true is still a failure', async (): Promise<void> => {
		sdk.configureEmail({target: 'blooms-ai', onError: () => {}});
		respond = () => ({status: 200, body: {success: false, message: 'nope'}});
		const r = send();
		await flush();
		expect(r).toEqual({ok: 0, fail: 1});
	});

	test('a network failure calls onError with NETWORK_FAILURE', async (): Promise<void> => {
		const seen: any[] = [];
		sdk.configureEmail({target: 'blooms-ai', onError: e => seen.push(e)});
		respond = () => 'network-error';
		const r = send();
		await flush();
		expect(r).toEqual({ok: 0, fail: 1});
		expect(seen[0]!.code).toBe('NETWORK_FAILURE');
	});

	test('an unknown target is refused and changes nothing', async (): Promise<void> => {
		const err = vi.spyOn(console, 'error').mockImplementation(() => {});
		sdk.configureEmail({target: 'elsewhere' as any});
		send();
		await flush();
		expect(emailCalls()[0]!.url).toBe(B1_GMAIL);
		expect(err).toHaveBeenCalled();
		err.mockRestore();
	});

	test("configureEmail({ target: 'bloomsight' }) moves it back", async (): Promise<void> => {
		sdk.configureEmail({target: 'blooms-ai'});
		sdk.configureEmail({target: 'bloomsight'});
		send();
		await flush();
		expect(emailCalls()[0]!.url).toBe(B1_GMAIL);
	});
});

// ── with init() ───────────────────────────────────────────────────────────────

describe('with init(), email and events stay independent', (): void => {

	test("the events target alone does not move email", async (): Promise<void> => {
		sdk.init({propertyToken: TOKEN, isDevelopmentMode: false, target: 'blooms-ai'});
		await flush(); calls = [];
		send();
		await flush();
		expect(emailCalls()[0]!.url).toBe(B1_GMAIL);
	});

	test('configureEmail moves email without moving events', async (): Promise<void> => {
		sdk.init({propertyToken: TOKEN, isDevelopmentMode: false});
		await flush(); calls = [];
		sdk.configureEmail({target: 'blooms-ai'});
		send();
		sdk.resolveSimpleEvent('65d735b122354c8ba6a489c2');
		await flush();
		expect(emailCalls()[0]!.url).toBe(B2_SEND);
		const event = calls.find(c => c.json && 'simpleEventToken' in c.json);
		expect(event!.url).toContain('footprint-api.bloomscorp.com/api/v1/simple-event-data/add');
	});

	test("init's emailTarget and emailApiBase work", async (): Promise<void> => {
		sdk.init({propertyToken: TOKEN, isDevelopmentMode: false, emailTarget: 'blooms-ai', emailApiBase: 'https://mail.example.test'});
		await flush(); calls = [];
		send();
		await flush();
		expect(emailCalls()[0]!.url).toBe('https://mail.example.test/api/bloomsight/email/send');
	});

	test("configureEmail beats init's emailTarget", async (): Promise<void> => {
		sdk.init({propertyToken: TOKEN, isDevelopmentMode: false, emailTarget: 'blooms-ai'});
		await flush(); calls = [];
		sdk.configureEmail({target: 'bloomsight'});
		send();
		await flush();
		expect(emailCalls()[0]!.url).toBe(B1_GMAIL);
	});

	test("init's onError is the fallback handler", async (): Promise<void> => {
		const seen: any[] = [];
		sdk.init({propertyToken: TOKEN, isDevelopmentMode: false, emailTarget: 'blooms-ai', onError: e => seen.push(e)});
		await flush(); calls = [];
		respond = () => ({status: 403, body: {success: false, code: 'SUBSCRIPTION_SUSPENDED', message: 'suspended'}});
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		send();
		await flush();
		expect(seen.some(e => e.code === 'SUBSCRIPTION_SUSPENDED')).toBe(true);
	});

	test('logOnly sends nothing, on blooms.ai too', async (): Promise<void> => {
		sdk.init({propertyToken: TOKEN, isDevelopmentMode: false, logOnly: true, emailTarget: 'blooms-ai'});
		await flush(); calls = [];
		send();
		await flush();
		expect(emailCalls()).toHaveLength(0);
	});
});
