export enum EmailEngineTypeEnum {
	GMAIL = 'GMAIL',
	CUSTOM_SMTP = 'CUSTOM_SMTP',
}

/**
 * What `sendEmail` accepts for its engine: the enum, or the plain string that
 * the enum member already is.
 *
 * TypeScript enums are **nominal**, so `'GMAIL'` does not assign to
 * `EmailEngineTypeEnum` even though they are identical at runtime. That forced
 * every wrapper around this library to write
 * `engine as unknown as EmailEngineTypeEnum` — a cast that exists purely to
 * defeat the type system, which is a sign the signature was wrong rather than
 * the caller.
 *
 * `` `${EmailEngineTypeEnum}` `` expands to the union of the enum's **values**,
 * so this alias stays correct by construction if a member is ever added.
 */
export type EmailEngineType = EmailEngineTypeEnum | `${EmailEngineTypeEnum}`;
