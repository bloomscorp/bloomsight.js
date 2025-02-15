import {IBrowser} from "./constant/browser";
import {IOperatingSystem} from "./constant/operating-system";
import {IDevice} from "./constant/device";
import {isDevelopmentMode} from "../configuration/configuration";
import {resolveDocument, resolveUserAgent, resolveWindow} from "../utils/browser-api";

const _userAgent: string = resolveUserAgent();
const window: Window | null = resolveWindow();
const document: Document | null = resolveDocument();


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

export function resolveBrowser(): IBrowser | string {

	let nameOffset: number = 0;
	let verOffset: number = 0;

	switch (true) {
		case _userAgent.includes("CriOS"):
			return IBrowser.Chrome_iOS;
		case _userAgent.includes("Edge"):
			return IBrowser.ME_Legacy;
		case _userAgent.includes("Edg"):
			return IBrowser.ME_Chromium;
		case _userAgent.includes("OPR"):
			return IBrowser.Opera_Next;
		case _userAgent.includes("Opera"):
			return IBrowser.Opera;
		case _userAgent.includes("Chrome"):
			return IBrowser.Chrome;
		case _userAgent.includes("Safari"):
			return IBrowser.Safari;
		case _userAgent.includes("Firefox"):
			return IBrowser.Firefox;
		case _userAgent.includes("MSIE") || _userAgent.includes("Trident"):
			return IBrowser.IE;
		case ((nameOffset = _userAgent.lastIndexOf(' ') + 1) < (verOffset = _userAgent.lastIndexOf('/'))):
			return _userAgent.substring(nameOffset, verOffset);
		default:
			return "Unknown";
	}
}

export function resolveBrowserVersion(): string {
	const match: RegExpMatchArray | null = _userAgent.match(/(Chrome|Firefox|Safari|Edge|IE|Opera|Trident)[\/\s](\d+(\.\d+)*)/);
	return match && match[2] ? match[2] : 'Unknown';
}

export function resolveOS(): IOperatingSystem {
	switch (true) {
		case /Android/i.test(_userAgent):
			return IOperatingSystem.Android;
		case /Windows/i.test(_userAgent):
			return IOperatingSystem.Windows;
		case /iPhone|iPad|iPod/i.test(_userAgent):
			return IOperatingSystem.iOS
		case /Mac OS/i.test(_userAgent):
			return /iPad|Macintosh/.test(_userAgent) && document && 'ontouchend' in document
				? IOperatingSystem.iOS
				: IOperatingSystem.MacOS;
		case /Linux/i.test(_userAgent) && !/Android/i.test(_userAgent):
			return IOperatingSystem.Linux;
		default:
			return IOperatingSystem.Unknown
	}
}

function isWebView(): boolean {
	// User-Agent based detection (WebView indicators)
	const userAgentCheck: boolean = /WebView|wv/.test(_userAgent) || /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(_userAgent);

	// Feature-based detection (Missing certain properties)
	const featureCheck: boolean | null = (window && (window.navigator as any)?.standalone === false) ||
		(window && (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)) ||
		(document && (document.referrer.startsWith('android-app://') || document.referrer.startsWith('ios-app://')));

	return userAgentCheck || !!featureCheck;
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
