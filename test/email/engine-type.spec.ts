import {describe, expect, test} from 'vitest';

import {EmailEngineTypeEnum} from '../../src/email/enums/emailEngineTypeEnum';
import type {EmailEngineType} from '../../src/email/enums/emailEngineTypeEnum';
import {sendEmail} from '../../src/index';

/**
 * These protect the two halves of the P6 fix.
 *
 * The bug: `EmailEngineTypeEnum` was referenced only in `sendEmail`'s signature
 * and never exported as a value, so the published package carried a declaration
 * for a value it did not ship. Separately, because TypeScript enums are
 * nominal, `'GMAIL'` would not assign to the parameter — so every wrapper wrote
 * `engine as unknown as EmailEngineTypeEnum`, a cast whose only purpose was to
 * defeat the type system.
 *
 * Note what these tests can and cannot do. In `src/` the enum has always been
 * real, so **no unit test can catch the packaging half** — that needs
 * `scripts/verify-runtime-exports.js`, which reads the built artifact. What
 * belongs here is the contract: the enum's values, and that a plain string is
 * accepted without a cast.
 */
describe('email engine type', () => {

	test('the enum members are their own string values', () => {
		// The runtime comparison in email-transmission.ts is a string equality,
		// so the member values are load-bearing, not cosmetic.
		expect(EmailEngineTypeEnum.GMAIL).toBe('GMAIL');
		expect(EmailEngineTypeEnum.CUSTOM_SMTP).toBe('CUSTOM_SMTP');
	});

	test('the enum is importable as a value, not only as a type', () => {
		// Reads trivial, and is exactly what was broken: the declaration
		// promised this object and the package did not contain it.
		expect(EmailEngineTypeEnum).toBeDefined();
		expect(Object.keys(EmailEngineTypeEnum).sort()).toEqual(['CUSTOM_SMTP', 'GMAIL']);
	});

	test('a plain string satisfies EmailEngineType, with no cast', () => {
		// Compile-time assertions. If the parameter narrowed back to the bare
		// enum, these stop compiling and the suite fails to build — which is
		// the point, since a cast at a call site would otherwise hide it.
		const fromLiteral: EmailEngineType = 'GMAIL';
		const fromOther: EmailEngineType = 'CUSTOM_SMTP';
		const fromEnum: EmailEngineType = EmailEngineTypeEnum.GMAIL;

		expect([fromLiteral, fromOther, fromEnum]).toEqual(['GMAIL', 'CUSTOM_SMTP', 'GMAIL']);
	});

	test('sendEmail accepts a plain string for its engine', () => {
		// Not called — it would issue a real request. Referencing the signature
		// is what is being checked: this file would not compile if `sendEmail`
		// still demanded the nominal enum.
		const call: (engine: EmailEngineType) => void = (engine) => {
			void ((): void => sendEmail(
				engine, 'engine-id', 'template-id', 'owner-id', new FormData(),
				() => {
				},
				() => {
				}
			));
		};

		expect(typeof call).toBe('function');
		expect(typeof sendEmail).toBe('function');
	});
});
