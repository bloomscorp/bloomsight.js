import type {IBloomsightError} from "../../b2/error";

export interface IConfig {
	propertyToken: string;
	isDevelopmentMode: boolean;
	stopSimpleEvent?: boolean;
	stopDataEvent?: boolean;
	stopPageViewEvent?: boolean;
	stopAll?: boolean;
	logOnly?: boolean;

	// ── blooms.ai (B2) ───────────────────────────────────────────────────────
	// Every field below is optional and absent by default, so upgrading the
	// library changes nothing: a project keeps talking to the standalone
	// Bloomsight server until `target` is set explicitly.

	/**
	 * Which backend to use.
	 *   'bloomsight' (default) — the standalone Bloomsight server, unchanged
	 *   'blooms-ai'            — Bloomsight inside blooms.ai
	 *
	 * This is the whole migration switch. Email is **not** affected: it always
	 * goes to the standalone server, whatever this is set to.
	 */
	target?: 'bloomsight' | 'blooms-ai';

	/**
	 * Origin of the blooms.ai API, without a trailing path — e.g.
	 * 'https://z.bloomscorp.com'. Only read when `target` is 'blooms-ai'.
	 * Exists so a project can be pointed at staging first, and so a future host
	 * change needs no library release. Defaults to production.
	 */
	apiBase?: string;

	/**
	 * Called whenever a blooms.ai request fails, so a project can route the
	 * failure into its own monitoring. A throwing handler is ignored.
	 */
	onError?: (error: IBloomsightError) => void;

	/**
	 * Full logging without turning on `isDevelopmentMode` (which also skips the
	 * property check). Useful while cutting a project over.
	 */
	debug?: boolean;
}
