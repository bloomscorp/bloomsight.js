/**
 * B2 target resolution.
 *
 * `target` is the single flag that moves a project from B1 to B2. It is absent
 * by default, so bumping the library changes nothing — a project keeps talking
 * to B1 until someone adds `target: 'blooms-ai'` to its `init()` call.
 */
import {config} from '../configuration/configuration';
import {DEFAULT_B2_API_BASE} from './request-mapper';

export type BloomsightTarget = 'bloomsight' | 'blooms-ai';

/** True when this project has been migrated to blooms.ai. */
export function isBloomsAiTarget(): boolean {
	return config?.target === 'blooms-ai';
}

/**
 * Where B2 sends its traffic. `apiBase` exists so one project can be pointed at
 * a staging blooms.ai before production, and so a future host change needs no
 * library release. Trailing slashes are dropped so callers can always append
 * an absolute path.
 */
export function resolveApiBase(): string {
	const base: string = (config?.apiBase || '').trim();
	return (base || DEFAULT_B2_API_BASE).replace(/\/+$/, '');
}

/** Extra logging. Implied by `isDevelopmentMode`, but can be turned on alone. */
export function isDebugEnabled(): boolean {
	return config?.debug === true || config?.isDevelopmentMode === true;
}
