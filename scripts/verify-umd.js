#!/usr/bin/env node
/**
 * Execute the built UMD bundle the way a plain-HTML site does — a script tag,
 * then calls on `window` — and assert it works.
 *
 * Why it exists: 0.8.0 through 0.9.2 shipped a `umd/production.js` in which
 * `sendEmail` threw on every call ("o.includes is not a function"). The source
 * was fine and every unit test passed; terser mis-minified a default parameter
 * whose function body declared a variable with the same name as the default
 * (`resolveBrowser(agent = _userAgent) { const _userAgent = agent … }`), so the
 * default ended up pointing at the module object. Only the minified artifact
 * was broken, and nothing ever ran it. This runs it.
 *
 * Runs in Node's `vm` with a minimal browser-shaped global: enough for the
 * bundle's load-time code and the calls below, nothing else. `fetch` is a stub
 * that records requests, so nothing leaves the machine.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FILE = path.join(__dirname, '../umd/production.js');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const B1_GMAIL = 'https://footprint-api.bloomscorp.com/api/v1/email-notifier/gmail/send';
const B2_SEND = 'https://z.bloomscorp.com/api/bloomsight/email/send';

function storage() {
	const m = new Map();
	return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), clear: () => m.clear() };
}

function browser() {
	const requests = [];
	const location = { host: 'shop.example.test', hostname: 'shop.example.test', pathname: '/contact', href: 'https://shop.example.test/contact', protocol: 'https:', origin: 'https://shop.example.test' };
	const document = { referrer: '', cookie: '', addEventListener() {}, removeEventListener() {}, createElement: () => ({ style: {} }), visibilityState: 'visible' };
	const navigator = { userAgent: UA, language: 'en-IN', languages: ['en-IN'], platform: 'MacIntel', userAgentData: { platform: 'macOS' } };
	const g = {
		navigator, document, location, localStorage: storage(), sessionStorage: storage(), console,
		FormData, URL, URLSearchParams, Blob, Headers, Request, Response, TextEncoder, TextDecoder, AbortController,
		setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask, Promise, crypto: globalThis.crypto,
		matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
		addEventListener() {}, removeEventListener() {}, history: { pushState() {}, replaceState() {} },
		fetch: async (url, init = {}) => {
			requests.push({ url: String(url), method: init.method || 'GET', body: init.body });
			return new Response(JSON.stringify({ success: true, message: 'ok', property: { name: location.host } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
		},
	};
	g.window = g; g.self = g; g.globalThis = g;
	return { context: vm.createContext(g), requests };
}

let failures = 0;
const check = (label, cond, detail) => { console.log(`verify-umd: ${cond ? 'ok  ' : 'FAIL'} ${label}${cond ? '' : ` → ${detail}`}`); if (!cond) failures++; };
const tick = () => new Promise(r => setTimeout(r, 50));

(async () => {
	if (!fs.existsSync(FILE)) { console.error(`verify-umd: ${FILE} is missing — run \`npm run bundle\` first`); process.exit(1); }
	const code = fs.readFileSync(FILE, 'utf8');

	// 1. An email-only site: no init(), default destination.
	let b = browser();
	vm.runInContext(code, b.context, { filename: 'umd/production.js' });
	const w = b.context;
	check('the script tag defines init, sendEmail, configureEmail on window',
		['init', 'sendEmail', 'configureEmail', 'resolveSimpleEvent', 'resolveDataEvent', 'pageViewObserver'].every(n => typeof w[n] === 'function'));

	const call = (engine = 'GMAIL') => {
		const f = new FormData(); f.append('name', 'Asha');
		try { w.sendEmail(engine, 'ENG', 'TPL', 'OWN', f, () => {}, () => {}); return null; } catch (e) { return e.message; }
	};
	let thrown = call();
	await tick();
	check('sendEmail without init() does not throw', thrown === null, thrown);
	const first = b.requests.find(r => r.method === 'POST');
	check('…and posts to the standalone server by default', first && first.url === B1_GMAIL, first && first.url);
	check('…with the browser name resolved, not crashed on',
		first && first.body instanceof FormData && /Chrome/.test(String(first.body.get('senderInfo[browserName]'))), first && String(first.body?.get?.('senderInfo[browserName]')));

	// 2. configureEmail moves it, still without init().
	b.requests.length = 0;
	w.configureEmail({ target: 'blooms-ai' });
	thrown = call();
	await tick();
	const moved = b.requests.find(r => r.method === 'POST');
	check("configureEmail({ target: 'blooms-ai' }) sends to blooms.ai", thrown === null && moved && moved.url === B2_SEND, thrown || (moved && moved.url));

	// 3. A site that calls init(): it must not throw, and events still go out.
	b = browser();
	vm.runInContext(code, b.context, { filename: 'umd/production.js' });
	let initError = null;
	try { b.context.init({ propertyToken: '65d72f0b5e990c6028790156', isDevelopmentMode: false }); } catch (e) { initError = e.message; }
	await tick(); await tick();
	check('init() does not throw', initError === null, initError);
	check('init() runs its property check', b.requests.some(r => r.url.includes('/property/get/')), b.requests.map(r => r.url).join(', '));

	if (failures) { console.error(`verify-umd: ${failures} check(s) failed — umd/production.js does not work as a script tag`); process.exit(1); }
	console.log('verify-umd: umd/production.js works as a script tag');
})().catch(e => { console.error('verify-umd:', e); process.exit(1); });
