import {describe, expect, test} from "vitest";
import {resolveBrowser, resolveBrowserVersion, resolveDevice, resolveOS} from "../../src/platform/platform";
import {IBrowser} from "../../src/platform/constant/browser";
import {IOperatingSystem} from "../../src/platform/constant/operating-system";
import {IDevice} from "../../src/platform/constant/device";

/**
 * These tests used to assert whatever the developer's own machine happened to
 * be — `resolveOS()` was pinned to `MacOS`, with a note saying "change this as
 * per your OS to pass the test" — so they passed locally and failed in CI on a
 * Linux runner.
 *
 * `resolveBrowser`, `resolveBrowserVersion` and `resolveOS` now take an optional
 * user agent (the same shape as `isBot(agent?)`), so every branch can be driven
 * with a real string and the result is identical on every machine. That is the
 * mocking the old TODO in this file was waiting for.
 */

const UA = {
	chromeMac:     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
	chromeLinux:   'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
	chromeWindows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
	chromeAndroid: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
	safariIphone:  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
	safariMac:     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
	firefoxLinux:  'Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
	edgeWindows:   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
	operaWindows:  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 OPR/110.0.0.0',
	chromeIos:     'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.0.0 Mobile/15E148 Safari/604.1',
	ie11:          'Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko',
};

describe('resolveOS', (): void => {

	test('detects macOS', (): void => {
		expect(resolveOS(UA.chromeMac)).toEqual(IOperatingSystem.MacOS);
		expect(resolveOS(UA.safariMac)).toEqual(IOperatingSystem.MacOS);
	});

	test('detects Linux', (): void => {
		expect(resolveOS(UA.chromeLinux)).toEqual(IOperatingSystem.Linux);
		expect(resolveOS(UA.firefoxLinux)).toEqual(IOperatingSystem.Linux);
	});

	test('detects Windows', (): void => {
		expect(resolveOS(UA.chromeWindows)).toEqual(IOperatingSystem.Windows);
		expect(resolveOS(UA.ie11)).toEqual(IOperatingSystem.Windows);
	});

	test('detects iOS', (): void => {
		expect(resolveOS(UA.safariIphone)).toEqual(IOperatingSystem.iOS);
	});

	// Android reports "Linux" in its user agent, so order matters in the
	// implementation: Android has to be checked before Linux.
	test('detects Android rather than Linux', (): void => {
		expect(resolveOS(UA.chromeAndroid)).toEqual(IOperatingSystem.Android);
	});

	test('falls back to Unknown', (): void => {
		expect(resolveOS('some-crawler/1.0')).toEqual(IOperatingSystem.Unknown);
	});
});

describe('resolveBrowser', (): void => {

	test('detects Chrome', (): void => {
		expect(resolveBrowser(UA.chromeMac)).toEqual(IBrowser.Chrome);
	});

	// Edge and Opera both carry "Chrome" in their user agent, so they must be
	// matched before it.
	test('detects Edge ahead of Chrome', (): void => {
		expect(resolveBrowser(UA.edgeWindows)).toEqual(IBrowser.ME_Chromium);
	});

	test('detects Opera ahead of Chrome', (): void => {
		expect(resolveBrowser(UA.operaWindows)).toEqual(IBrowser.Opera_Next);
	});

	// Chrome on iOS reports CriOS and must not be read as desktop Chrome.
	test('detects Chrome on iOS', (): void => {
		expect(resolveBrowser(UA.chromeIos)).toEqual(IBrowser.Chrome_iOS);
	});

	test('detects Safari', (): void => {
		expect(resolveBrowser(UA.safariMac)).toEqual(IBrowser.Safari);
	});

	test('detects Firefox', (): void => {
		expect(resolveBrowser(UA.firefoxLinux)).toEqual(IBrowser.Firefox);
	});

	test('detects Internet Explorer via Trident', (): void => {
		expect(resolveBrowser(UA.ie11)).toEqual(IBrowser.IE);
	});
});

describe('resolveBrowserVersion', (): void => {

	test('reads the Chrome version', (): void => {
		expect(resolveBrowserVersion(UA.chromeMac)).toEqual('124.0.0.0');
	});

	test('reads the Firefox version', (): void => {
		expect(resolveBrowserVersion(UA.firefoxLinux)).toEqual('125.0');
	});

	test('returns Unknown when there is no version to read', (): void => {
		expect(resolveBrowserVersion('something-without-a-version')).toEqual('Unknown');
	});
});

describe('the default argument', (): void => {

	/**
	 * Production always calls these with no argument, so the default has to
	 * resolve to the live user agent. Asserting equality against an explicit
	 * `navigator.userAgent` proves that without pinning the result to any
	 * particular machine.
	 */
	test('falls back to the live user agent', (): void => {
		expect(resolveOS()).toEqual(resolveOS(navigator.userAgent));
		expect(resolveBrowser()).toEqual(resolveBrowser(navigator.userAgent));
		expect(resolveBrowserVersion()).toEqual(resolveBrowserVersion(navigator.userAgent));
	});

	test('the live environment resolves to something known', (): void => {
		expect(Object.values(IOperatingSystem)).toContain(resolveOS());
	});
});

describe('resolveDevice', (): void => {

	/**
	 * Unlike the others this is not a pure function of the user agent — it also
	 * consults `matchMedia`, `navigator.standalone`, `navigator.userAgentData`
	 * and `document.referrer` to spot a webview. Those cannot be driven from a
	 * string, so asserting a specific device would be asserting the runner's
	 * environment, which is exactly the bug this file used to have.
	 *
	 * What is worth checking is that it always returns a value from the enum.
	 */
	test('returns a known device type for the current environment', (): void => {
		expect(Object.values(IDevice)).toContain(resolveDevice());
	});
});
