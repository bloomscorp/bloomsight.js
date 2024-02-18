import {IBrowser} from "./constant/browser";
import {IOperatingSystem} from "./constant/operating-system";
import {IDevice} from "./constant/device";
import {isDevelopmentMode} from "../configuration/configuration";

const _userAgent: string = window.navigator.userAgent;

export function initPlatform(): void {
	const browser: string = resolveBrowser();
	const os: string = resolveOS();
	const device: string = resolveDevice();

	if (!isDevelopmentMode()) return;

	console.log(`browser: ${browser}`);
	console.log(`os: ${os}`);
	console.log(`device: ${device}`);
}

export function resolveBrowser(): IBrowser | string {

	let nameOffset: number = 0;
	let verOffset: number = 0;

	switch (true) {
		case _userAgent.indexOf("Opera") !== -1:
			return IBrowser.Opera;
		case _userAgent.indexOf("OPR") !== -1:
			return IBrowser.Opera_Next;
		case _userAgent.indexOf("Edge") !== -1:
			return IBrowser.ME_Legacy;
		case _userAgent.indexOf("Edg") !== -1:
			return IBrowser.ME_Chromium;
		case _userAgent.indexOf("Chrome") !== -1:
			return IBrowser.Chrome;
		case _userAgent.indexOf("Safari") !== -1:
			return IBrowser.Safari;
		case _userAgent.indexOf("Firefox") !== -1:
			return IBrowser.Firefox;
		case _userAgent.indexOf("MSIE") !== -1:
		case _userAgent.indexOf("Trident") !== -1:
			return IBrowser.IE;
		case ((nameOffset = _userAgent.lastIndexOf(' ') + 1) < (verOffset = _userAgent.lastIndexOf('/'))):
			return _userAgent.substring(nameOffset, verOffset);
		default:
			return IBrowser.Unknown;
	}
}

export function resolveBrowserVersion(): string {
	const match: RegExpMatchArray | null = _userAgent.match(/(Chrome|Firefox|Safari|Edge|IE|Opera|Trident)[\/\s](\d+(\.\d+)*)/);
	return match && match[2] ? match[2] : 'Unknown';
}

export function resolveOS(): IOperatingSystem {
	switch (true) {
		case _userAgent.indexOf("Windows") !== -1:
			return IOperatingSystem.Windows;
		case _userAgent.indexOf("Mac OS") !== -1:
			return IOperatingSystem.MacOS;
		case _userAgent.indexOf("Linux") !== -1:
			return IOperatingSystem.Linux;
		case _userAgent.indexOf("Android") !== -1:
			return IOperatingSystem.Android;
		case _userAgent.indexOf("iOS") !== -1:
			return IOperatingSystem.iOS;
		default:
			return IOperatingSystem.Unknown;
	}
}

export function resolveDevice(): IDevice {
	if (
		/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(_userAgent)
	) {
		return IDevice.Tablet;
	} else if (
		/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|webOS)/i.test(_userAgent)
	) {
		return IDevice.Mobile
	} else {
		return IDevice.Desktop;
	}
}
