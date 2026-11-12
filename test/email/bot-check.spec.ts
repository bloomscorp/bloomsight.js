import {afterEach, beforeAll, beforeEach, describe, expect, test, vi} from 'vitest';

/**
 * The bot check on email sent to blooms.ai (blooms.ai backend-sending.md §2.2.3).
 *
 *   • every send carries `bloomsightClient` (the server's report uses it)
 *   • a form field named `bloomsightHp` goes as the honeypot, not as a value
 *   • 428 BOT_CHECK_REQUIRED → a Turnstile token → the same send once more, with it
 *   • any failure on the way is `BOT_CHECK_FAILED` and runs the form's failure path
 *
 * Cloudflare is never reached: a fake `window.turnstile` stands in, and the one
 * test that loads the script fails its load on purpose.
 */

const B2_SEND: string = 'https://z.bloomscorp.com/api/bloomsight/email/send';

interface ICall { url: string; form: Record<string, string> }
let calls: ICall[] = [];
let answers: Array<{status: number; body: unknown}> = [];

let sdk: typeof import('../../src/index');
let resetEmailConfig: () => void;
let resetErrorDedupe: () => void;
let resetBotCheck: () => void;
let TURNSTILE_SCRIPT: string;

beforeAll(async (): Promise<void> => {
	window.fetch = vi.fn(async (input: any, init: any = {}): Promise<Response> => {
		const form: Record<string, string> = init.body instanceof FormData
			? Object.fromEntries([...(init.body as FormData).entries()].map(([k, v]) => [k, String(v)])) : {};
		calls.push({url: String(input), form});
		const next = answers.shift() || {status: 202, body: {success: true}};
		return new Response(JSON.stringify(next.body), {status: next.status, headers: {'Content-Type': 'application/json'}});
	}) as any;
	sdk = await import('../../src/index');
	({resetEmailConfig} = await import('../../src/email/email-config'));
	({resetErrorDedupe} = await import('../../src/b2/error'));
	({resetBotCheck, TURNSTILE_SCRIPT} = await import('../../src/b2/bot-check'));
});

let rendered: Array<{sitekey: string; appearance: string}> = [];
let removed: string[] = [];
let behaviour: 'pass' | 'fail' | 'throw' = 'pass';

function fakeTurnstile(): void {
	(window as any).turnstile = {
		render: (container: HTMLElement, options: any): string => {
			rendered.push({sitekey: options.sitekey, appearance: options.appearance});
			expect(document.body.contains(container)).toBe(true);
			if (behaviour === 'throw') throw new Error('bad site key');
			setTimeout((): void => {
				if (behaviour === 'pass') options.callback('TOKEN-123');
				else options['error-callback']();
			}, 5);
			return 'widget-1';
		},
		remove: (id: string): void => { removed.push(id); },
	};
}

beforeEach((): void => {
	calls = []; answers = []; rendered = []; removed = []; behaviour = 'pass';
	resetEmailConfig(); resetErrorDedupe(); resetBotCheck();
	fakeTurnstile();
	sdk.configureEmail({target: 'blooms-ai', onError: () => {}});
});

afterEach((): void => {
	delete (window as any).turnstile;
	document.querySelectorAll('script[src*="turnstile"]').forEach(s => s.remove());
});

const flush = (ms: number = 80): Promise<void> => new Promise(r => setTimeout(r, ms));
const send = (fields: Record<string, string> = {name: 'Asha'}) => {
	const result = {ok: 0, fail: 0};
	const form = new FormData();
	Object.entries(fields).forEach(([k, v]) => form.append(k, v));
	sdk.sendEmail('GMAIL', 'ENGINE1', 'TEMPLATE1', 'OWNER1', form, () => { result.ok++; }, () => { result.fail++; });
	return result;
};
const REQUIRED = {status: 428, body: {success: false, code: 'BOT_CHECK_REQUIRED', message: 'Please confirm you are not a robot', siteKey: '0x4AAAAAAAsite'}};

describe('fields blooms.ai reads', (): void => {
	test('every send says which library sent it', async (): Promise<void> => {
		send();
		await flush();
		expect(calls[0]!.form.bloomsightClient).toMatch(/^bloomsight\.js\/\d+\.\d+\.\d+/);
	});

	test('a form field named bloomsightHp is sent as the honeypot, not as a template value', async (): Promise<void> => {
		send({name: 'Asha', bloomsightHp: ''});
		await flush();
		expect(calls[0]!.form).toHaveProperty('bloomsightHp', '');
		expect(calls[0]!.form).not.toHaveProperty('metadata[bloomsightHp]');
		expect(calls[0]!.form).toHaveProperty('metadata[name]', 'Asha');
	});

	test('no token is sent unless blooms.ai asks for one', async (): Promise<void> => {
		send();
		await flush();
		expect(calls).toHaveLength(1);
		expect(calls[0]!.form).not.toHaveProperty('bloomsightBotToken');
		expect(rendered).toHaveLength(0);
	});
});

describe('when blooms.ai asks for the bot check', (): void => {
	test('the check runs with the site key from the server, and the send is repeated with the token', async (): Promise<void> => {
		answers = [REQUIRED, {status: 202, body: {success: true}}];
		const r = send();
		await flush();
		expect(rendered).toEqual([{sitekey: '0x4AAAAAAAsite', appearance: 'interaction-only'}]);
		expect(calls).toHaveLength(2);
		expect(calls[1]!.url).toBe(B2_SEND);
		expect(calls[1]!.form).toMatchObject({...calls[0]!.form, bloomsightBotToken: 'TOKEN-123'});
		expect(r).toEqual({ok: 1, fail: 0});
	});

	test('the widget is removed afterwards and leaves nothing on the page', async (): Promise<void> => {
		answers = [REQUIRED, {status: 202, body: {success: true}}];
		send();
		await flush();
		expect(removed).toEqual(['widget-1']);
		expect(document.querySelector('[data-bloomsight-bot-check]')).toBeNull();
	});

	test('a failed check: BOT_CHECK_FAILED, the failure path runs, nothing is sent again', async (): Promise<void> => {
		const seen: any[] = [];
		sdk.configureEmail({target: 'blooms-ai', onError: e => seen.push(e)});
		behaviour = 'fail';
		answers = [REQUIRED];
		const r = send();
		await flush();
		expect(r).toEqual({ok: 0, fail: 1});
		expect(seen[0]).toMatchObject({code: 'BOT_CHECK_FAILED'});
		expect(calls).toHaveLength(1);
		expect(document.querySelector('[data-bloomsight-bot-check]')).toBeNull();
	});

	test('a widget that cannot start: BOT_CHECK_FAILED', async (): Promise<void> => {
		const seen: any[] = [];
		sdk.configureEmail({target: 'blooms-ai', onError: e => seen.push(e)});
		behaviour = 'throw';
		answers = [REQUIRED];
		const r = send();
		await flush();
		expect(r).toEqual({ok: 0, fail: 1});
		expect(seen[0]!.code).toBe('BOT_CHECK_FAILED');
	});

	test('the token refused by blooms.ai: its own code reaches the form', async (): Promise<void> => {
		const seen: any[] = [];
		sdk.configureEmail({target: 'blooms-ai', onError: e => seen.push(e)});
		answers = [REQUIRED, {status: 403, body: {success: false, code: 'BOT_CHECK_FAILED', message: 'The robot check did not pass.'}}];
		const r = send();
		await flush();
		expect(r).toEqual({ok: 0, fail: 1});
		expect(seen[0]).toMatchObject({code: 'BOT_CHECK_FAILED', status: 403});
	});

	test('asked again after passing: it stops, never loops', async (): Promise<void> => {
		answers = [REQUIRED, REQUIRED, REQUIRED];
		const r = send();
		await flush();
		expect(calls).toHaveLength(2);
		expect(r).toEqual({ok: 0, fail: 1});
	});

	test("Cloudflare's script loads only when needed, and a blocked load says why", async (): Promise<void> => {
		// A dead local address stands in for Cloudflare, so the load fails for real
		// without the test ever reaching Cloudflare.
		const DEAD: string = 'http://127.0.0.1:9/turnstile-api.js';
		resetBotCheck({scriptUrl: DEAD});
		delete (window as any).turnstile;
		const appended: string[] = [];
		const realAppend = document.head.appendChild.bind(document.head);
		const spy = vi.spyOn(document.head, 'appendChild').mockImplementation((node: any) => {
			if (node instanceof HTMLScriptElement) appended.push(node.src);
			return realAppend(node);
		});
		const seen: any[] = [];
		sdk.configureEmail({target: 'blooms-ai', onError: e => seen.push(e)});
		send();
		await flush();
		expect(appended).toEqual([]);

		answers = [REQUIRED];
		send();
		await flush(1500);
		spy.mockRestore();
		expect(appended).toEqual([DEAD]);
		expect(seen.at(-1)).toMatchObject({code: 'BOT_CHECK_FAILED'});
		expect(seen.at(-1).message).toMatch(/challenges\.cloudflare\.com/);
		expect(document.querySelector(`script[src="${DEAD}"]`)).toBeNull();
	});

	test('the real script address is Cloudflare\'s, loaded explicitly', (): void => {
		expect(TURNSTILE_SCRIPT).toBe('https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit');
	});

	test('logOnly still sends nothing at all', async (): Promise<void> => {
		sdk.init({propertyToken: '65d72f0b5e990c6028790156', isDevelopmentMode: false, logOnly: true} as any);
		await flush();
		calls = [];
		answers = [REQUIRED];
		send();
		await flush();
		expect(calls.filter(c => c.url === B2_SEND)).toHaveLength(0);
	});
});
