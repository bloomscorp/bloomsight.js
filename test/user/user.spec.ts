import {describe, expect, test} from "vitest";
import {hasUserReturnedBeyondNewUserTenureLimit} from "../../src/user/user";

describe("should detect user correctly", (): void => {

	test("should state user has returned within new user tenure limit", (): void => {
		const currentTimestampInMilliseconds: number = Date.now();
		const withinTenureLimitTimestampInMilliseconds: number = currentTimestampInMilliseconds - (45 * 24 * 60 * 60 * 1000);

		expect(
			hasUserReturnedBeyondNewUserTenureLimit(currentTimestampInMilliseconds)
		).toBeFalsy();

		expect(
			hasUserReturnedBeyondNewUserTenureLimit(withinTenureLimitTimestampInMilliseconds)
		).toBeFalsy();
	})

	test("should state user has returned beyond new user tenure limit", (): void => {
		const currentTimestampInMilliseconds: number = Date.now();
		const beyondTenureLimitTimestampInMilliseconds: number = currentTimestampInMilliseconds - (50 * 24 * 60 * 60 * 1000);

		expect(
			hasUserReturnedBeyondNewUserTenureLimit(beyondTenureLimitTimestampInMilliseconds)
		).toBeTruthy();
	})
})
