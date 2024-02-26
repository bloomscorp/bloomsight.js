import {describe, expect, test} from "vitest";
import {resolveBrowser, resolveDevice, resolveOS} from "../../src/platform/platform";
import {IBrowser} from "../../src/platform/constant/browser";
import {IOperatingSystem} from "../../src/platform/constant/operating-system";
import {IDevice} from "../../src/platform/constant/device";


describe('should detect platform correctly', (): void => {

	/**
	 * TODO: implement browser user agent mocking to test all possibilities once vitest supports it
	 * https://vitest.dev/api/vi.html#vi-mock
	 * https://github.com/vitest-dev/vitest/issues/3046
	 */
	test('should detect Google Chrome as browser', (): void => {
		expect(resolveBrowser()).toEqual(IBrowser.Chrome);
	});

	test('should detect MacOS as operating system', (): void => {
		expect(resolveOS()).toEqual(IOperatingSystem.MacOS); // TODO: change this as per your OS to pass the test
	});

	test('should detect Desktop as device', (): void => {
		expect(resolveDevice()).toEqual(IDevice.Desktop);
	});
})
