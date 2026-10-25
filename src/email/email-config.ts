/**
 * Where email goes — its own switch, independent of the events `target`.
 *
 * Many sites use this library for email alone and never call `init()`, so the
 * switch cannot live only in `init`'s config: `configureEmail()` sets it at
 * any time, and `init`'s `emailTarget` / `emailApiBase` are read as a fallback.
 * With neither, email goes to the standalone server exactly as before.
 * MIGRATION.md, "Moving email".
 */
import {config} from '../configuration/configuration';
import {DEFAULT_B2_API_BASE} from '../b2/request-mapper';
import type {IBloomsightError} from '../b2/error';

export type EmailTarget = 'bloomsight' | 'blooms-ai';

export interface IEmailConfig {
	/** 'bloomsight' (default) — the standalone server; 'blooms-ai' — blooms.ai. */
	target?: EmailTarget;
	/** Origin of the blooms.ai API, e.g. 'https://z.bloomscorp.com'. blooms.ai only. */
	apiBase?: string;
	/** Every blooms.ai email failure. Falls back to `init`'s `onError`. */
	onError?: (error: IBloomsightError) => void;
	/** Full logging of email sends. */
	debug?: boolean;
}

let emailConfig: IEmailConfig = {};

const TARGETS: EmailTarget[] = ['bloomsight', 'blooms-ai'];

/** Choose where `sendEmail` sends. Callable before, after or without `init()`. */
export function configureEmail(options: IEmailConfig = {}): void {
	if (options.target !== undefined && !TARGETS.includes(options.target)) {
		console.error(`bloomsight.js: configureEmail target must be 'bloomsight' or 'blooms-ai', got '${String(options.target)}' — ignored`);
		return;
	}
	emailConfig = {...emailConfig, ...options};
}

/** `configureEmail()` first, then `init`'s `emailTarget`, then the standalone server. */
export function resolveEmailTarget(): EmailTarget {
	return emailConfig.target ?? config?.emailTarget ?? 'bloomsight';
}

export function isEmailOnBloomsAi(): boolean {
	return resolveEmailTarget() === 'blooms-ai';
}

export function resolveEmailApiBase(): string {
	const base: string = (emailConfig.apiBase || config?.emailApiBase || '').trim();
	return (base || DEFAULT_B2_API_BASE).replace(/\/+$/, '');
}

export function emailErrorHandler(): IEmailConfig['onError'] {
	return emailConfig.onError ?? config?.onError;
}

export function isEmailDebug(): boolean {
	return emailConfig.debug === true || config?.debug === true || config?.isDevelopmentMode === true;
}

/** Test seam: the setting is module state and would leak between cases. */
export function resetEmailConfig(): void {
	emailConfig = {};
}
