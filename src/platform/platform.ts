import {IBrowser} from "./constant/browser";
import {IOperatingSystem} from "./constant/operating-system";
import {IDevice} from "./constant/device";
import {isDevelopmentMode} from "../configuration/configuration";
import {resolveDocument, resolveUserAgent, resolveWindow} from "../utils/browser-api";

// Captured once, at module load. The exported detectors take an optional user
// agent so they can be tested against real strings rather than whatever browser
// happens to be running them — the same shape as `isBot(agent?)` in
// src/utils/bot-handler.ts. Passing nothing uses the live one, so no call site
// changes.
const _userAgent: string = resolveUserAgent();
const window: Window = resolveWindow();
const document: Document = resolveDocument();


export function initPlatform(): void {
	const browser: string = resolveBrowser();
	const version: string = resolveBrowserVersion();
	const os: string = resolveOS();
	const device: string = resolveDevice();

	if (!isDevelopmentMode()) return;

	console.log(`browser: ${browser}`);
	console.log(`version: ${version}`);
	console.log(`os: ${os}`);
	console.log(`device: ${device}`);
}

export function resolveBrowser(agent: string = _userAgent): IBrowser | string {

	// Not named `_userAgent`: shadowing the module-level one is what terser
	// mis-minified in the UMD bundle — the default parameter ended up pointing
	// at the wrong binding, so `resolveBrowser()` threw (0.8.0–0.9.2).
	const ua: string = agent;

	let nameOffset: number = 0;
	let verOffset: number = 0;

	switch (true) {
		case ua.includes("CriOS"):
			return IBrowser.Chrome_iOS;
		case ua.includes("Edge"):
			return IBrowser.ME_Legacy;
		case ua.includes("Edg"):
			return IBrowser.ME_Chromium;
		case ua.includes("OPR"):
			return IBrowser.Opera_Next;
		case ua.includes("Opera"):
			return IBrowser.Opera;
		case ua.includes("Chrome"):
			return IBrowser.Chrome;
		case ua.includes("Safari"):
			return IBrowser.Safari;
		case ua.includes("Firefox"):
			return IBrowser.Firefox;
		case ua.includes("MSIE") || ua.includes("Trident"):
			return IBrowser.IE;
		case ((nameOffset = ua.lastIndexOf(' ') + 1) < (verOffset = ua.lastIndexOf('/'))):
			return ua.substring(nameOffset, verOffset);
		default:
			return "Unknown";
	}
}

export function resolveBrowserVersion(agent: string = _userAgent): string {
	const match: RegExpMatchArray | null = agent.match(/(Chrome|Firefox|Safari|Edge|IE|Opera|Trident)[\/\s](\d+(\.\d+)*)/);
	return match && match[2] ? match[2] : 'Unknown';
}

export function resolveOS(agent: string = _userAgent): IOperatingSystem {

	// Not named `_userAgent`: shadowing the module-level one is what terser
	// mis-minified in the UMD bundle — the default parameter ended up pointing
	// at the wrong binding, so `resolveBrowser()` threw (0.8.0–0.9.2).
	const ua: string = agent;

	switch (true) {
		case /Android/i.test(ua):
			return IOperatingSystem.Android;
		case /Windows/i.test(ua):
			return IOperatingSystem.Windows;
		case /iPhone|iPad|iPod/i.test(ua):
			return IOperatingSystem.iOS
		case /Mac OS/i.test(ua):
			return /iPad|Macintosh/.test(ua) && document && 'ontouchend' in document
				? IOperatingSystem.iOS
				: IOperatingSystem.MacOS;
		case /Linux/i.test(ua) && !/Android/i.test(ua):
			return IOperatingSystem.Linux;
		default:
			return IOperatingSystem.Unknown
	}
}

function isWebView(): boolean {

	const userAgentCheck: boolean = !!_userAgent.match(new RegExp(
		'(WebView|(iPhone|iPod|iPad)(?!.*Safari)|Android.*(;\\s+wv|Version/\\d.\\d\\s+Chrome/\\d+(\\.0){3})|Linux; U; Android)', 'ig')
	);

	const featureCheck: boolean = window.matchMedia('(display-mode: standalone)').matches ||
		(typeof (window.navigator as any)?.standalone !== 'undefined' && (window.navigator as any)?.standalone) ||
		document?.referrer?.startsWith('android-app://') ||
		document?.referrer?.startsWith('ios-app://');

	const missingFeatureCheck: boolean = typeof (window.navigator as any)?.userAgentData?.platform === 'undefined';


	return userAgentCheck || featureCheck || missingFeatureCheck;
}

export function resolveDevice(): IDevice {

	if (isWebView()) return IDevice.WebView;

	if (
		/iPad/i.test(_userAgent) ||
		(/Macintosh/.test(_userAgent) && document && 'ontouchend' in document)
	) return IDevice.Tablet;

	if (/Mobile|iPhone|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|hpw|webOS/i.test(_userAgent)) {
		return IDevice.Mobile;
	}

	return IDevice.Desktop;
}

export function isDesktopModeEnabled(): boolean {
	return window.innerWidth > window.screen.availWidth;
}
