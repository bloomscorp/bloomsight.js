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
	 * This is the migration switch for events. Email is **not** affected: it
	 * has its own switch, `emailTarget` below or `configureEmail()`.
	 */
	target?: 'bloomsight' | 'blooms-ai';

	/**
	 * Where `sendEmail` goes, independent of `target`. 'bloomsight' (default)
	 * or 'blooms-ai'. `configureEmail()` sets the same thing without `init()`,
	 * and wins when both are given. MIGRATION.md, "Moving email".
	 */
	emailTarget?: 'bloomsight' | 'blooms-ai';

	/** blooms.ai API origin for email. Not shared with `apiBase`. Defaults to production. */
	emailApiBase?: string;

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
