/**
 * This library's version, sent with email to blooms.ai as `bloomsightClient` so
 * the server's report shows which projects run a library that can answer the
 * bot check (blooms.ai backend-sending.md §2.2.4). Filled in at build time from
 * package.json (tsup.config.ts, vitest.config.ts).
 */
declare const __BLOOMSIGHT_VERSION__: string;

export const LIBRARY_VERSION: string =
	typeof __BLOOMSIGHT_VERSION__ === 'string' ? __BLOOMSIGHT_VERSION__ : 'dev';

export const CLIENT_NAME: string = `bloomsight.js/${LIBRARY_VERSION}`;
