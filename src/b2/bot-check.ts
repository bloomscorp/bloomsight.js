/**
 * The bot check for email sent to blooms.ai — blooms.ai
 * documentation/bloomsight/backend-sending.md §2.2.3.
 *
 * Nothing here runs unless blooms.ai asks for it: a send answered with
 * `428 BOT_CHECK_REQUIRED { siteKey }` loads Cloudflare Turnstile (once, only
 * then, with `render=explicit`), gets a single-use token from the visitor's
 * browser, and the send is repeated with it. The developer writes nothing, and no
 * key goes in the site's code: the site key comes from the server.
 *
 * The widget stays invisible unless Cloudflare needs the visitor to click; then it
 * shows over the page, and is removed afterwards.
 */

export const TURNSTILE_SCRIPT: string = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/** How long Cloudflare's script may take to load before the check fails. */
const SCRIPT_TIMEOUT_MS: number = 15000;
/** How long a visitor may take over an interactive challenge. */
const CHALLENGE_TIMEOUT_MS: number = 120000;

interface ITurnstile {
	render(container: HTMLElement, options: Record<string, unknown>): string | undefined;
	remove(widgetId: string): void;
}

let loading: Promise<ITurnstile> | null = null;
let scriptUrl: string = TURNSTILE_SCRIPT;

function loadTurnstile(): Promise<ITurnstile> {
	const existing: ITurnstile | undefined = (window as any).turnstile;
	if (existing) return Promise.resolve(existing);
	if (loading) return loading;

	loading = new Promise<ITurnstile>((resolve, reject): void => {
		const script: HTMLScriptElement = document.createElement('script');
		script.src = scriptUrl;
		script.async = true;
		script.defer = true;
		const fail = (reason: string): void => {
			clearTimeout(timer);
			loading = null;
			script.remove();
			reject(new Error(reason));
		};
		const timer = setTimeout(
			(): void => fail('Cloudflare\'s bot check did not load in time'),
			SCRIPT_TIMEOUT_MS
		);
		script.onload = (): void => {
			clearTimeout(timer);
			const turnstile: ITurnstile | undefined = (window as any).turnstile;
			if (turnstile) resolve(turnstile);
			else fail('Cloudflare\'s bot check loaded but did not start');
		};
		script.onerror = (): void => fail(
			'Cloudflare\'s bot check could not load. A Content Security Policy must allow '
			+ 'https://challenges.cloudflare.com for scripts and frames, and blockers may stop it.'
		);
		document.head.appendChild(script);
	});
	return loading;
}

/** A single-use token for this send. Rejects with a readable reason. */
export async function getBotToken(siteKey: string): Promise<string> {
	const turnstile: ITurnstile = await loadTurnstile();

	return new Promise<string>((resolve, reject): void => {
		// A full-page layer that lets clicks through, so a widget that needs the
		// visitor shows in the middle of the screen without blocking the page.
		const layer: HTMLDivElement = document.createElement('div');
		layer.setAttribute('data-bloomsight-bot-check', '');
		layer.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:2147483647;pointer-events:none;';
		const box: HTMLDivElement = document.createElement('div');
		box.style.pointerEvents = 'auto';
		layer.appendChild(box);
		document.body.appendChild(layer);

		let widgetId: string | undefined;
		let settled: boolean = false;
		const finish = (outcome: () => void): void => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			try { if (widgetId !== undefined) turnstile.remove(widgetId); } catch { /* already gone */ }
			layer.remove();
			outcome();
		};
		const timer = setTimeout(
			(): void => finish((): void => reject(new Error('the bot check was not completed'))),
			CHALLENGE_TIMEOUT_MS
		);

		try {
			widgetId = turnstile.render(box, {
				sitekey: siteKey,
				appearance: 'interaction-only',
				callback: (token: string): void => finish((): void => resolve(token)),
				'error-callback': (): void => finish((): void => reject(new Error('the bot check failed'))),
				'expired-callback': (): void => finish((): void => reject(new Error('the bot check expired'))),
				'timeout-callback': (): void => finish((): void => reject(new Error('the bot check timed out'))),
			});
		} catch (cause) {
			finish((): void => reject(new Error(`the bot check could not start (${(cause as Error)?.message || 'error'})`)));
		}
	});
}

/** Test seam: the loader is module state, and tests must never fetch Cloudflare's script. */
export function resetBotCheck(options: {scriptUrl?: string} = {}): void {
	loading = null;
	scriptUrl = options.scriptUrl ?? TURNSTILE_SCRIPT;
}
