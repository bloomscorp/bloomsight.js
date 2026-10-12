import {initPlatform} from "./platform/platform";
import {initUser} from "./user/user";
import {initSession} from "./session/session";
import {pageViewObserver as pageViewObserverB1} from "./event/page-view-event";
import {IConfig} from "./configuration/interface/config";
import {config, initConfig, isConfiguredProperly} from "./configuration/configuration";

import {resolveSimpleEvent as resolveSimpleEventB1} from './event/simple-event';
import {resolveDataEvent as resolveDataEventB1} from './event/data-event';
import {sendEmail} from "./email/email";
import {validateProperty} from "./property/property";
import {isBrowser, resolveHost} from "./utils/browser-api";

import {initB2} from "./b2";
import {isBloomsAiTarget} from "./b2/config";
import {resolveSimpleEventB2, resolveDataEventB2} from "./b2/event";
import {debugLog} from "./b2/error";
import {EmailEngineTypeEnum} from "./email/enums/emailEngineTypeEnum";

/**
 * Two backends live in this library side by side:
 *
 *   B1 — the standalone Bloomsight server. Everything under `src/` except
 *        `src/b2/`. **Untouched**, and what you get by default.
 *   B2 — Bloomsight inside blooms.ai. Everything under `src/b2/`.
 *
 * The only thing that selects between them is `target` in the config. It is
 * absent by default, so bumping to this version and redeploying changes nothing
 * about how a project behaves; a project moves to blooms.ai only when someone
 * adds `target: 'blooms-ai'` to its `init()` call.
 *
 * Email is not part of B2 and always goes to the standalone server.
 *
 * Each public function branches once, at call time rather than at load time,
 * because `initConfig()` has not run when this module is evaluated.
 */

function initB1(): void {
	validateProperty(config.propertyToken, resolveHost())
		.then((isValid: boolean): void => {

			if (!isValid) {
				console.error(`bloomsight.js: propertyToken is not valid for ${resolveHost()}`);
				config.stopAll = true;
			} else {
				config.stopAll = false;
			}

			initPlatform();
			initUser();
			initSession();
		})
		.catch((error: string): void => {
			console.error(error)
		})
}

function init(appConfig: IConfig): void {

	if (!isConfiguredProperly(appConfig)) {
		console.error('bloomsight.js: propertyToken, isDevelopmentMode are mandatory parameters');
		return;
	}

	initConfig(appConfig);

	if (isBloomsAiTarget()) initB2();
	else initB1();
}

function resolveSimpleEvent(eventToken: string, label: string = ''): void {
	if (isBloomsAiTarget()) resolveSimpleEventB2(eventToken, label);
	else resolveSimpleEventB1(eventToken, label);
}

function resolveDataEvent(
	eventToken: string,
	eventData: { [key: string]: any },
	label: string = ''
): void {
	if (isBloomsAiTarget()) resolveDataEventB2(eventToken, eventData, label);
	else resolveDataEventB1(eventToken, eventData, label);
}

/**
 * blooms.ai has no page-view endpoint, so under B2 this is a no-op rather than
 * an error. `ngx-bloomsight` wires it to router `NavigationEnd` automatically,
 * and that must keep working untouched for a migrated project.
 */
function pageViewObserver(): void {
	if (isBloomsAiTarget()) {
		debugLog('page views are not collected on blooms.ai; pageViewObserver() is a no-op');
		return;
	}
	pageViewObserverB1();
}

if (isBrowser()) {
	(window as any).init = init;
	(window as any).resolveSimpleEvent = resolveSimpleEvent;
	(window as any).resolveDataEvent = resolveDataEvent;
	(window as any).pageViewObserver = pageViewObserver;
	(window as any).sendEmail = sendEmail;
}

export {
	init,
	resolveSimpleEvent,
	resolveDataEvent,
	pageViewObserver,
	sendEmail,

	/**
	 * Exported as a **value**, which is the whole point.
	 *
	 * This enum previously existed only as a type: it was referenced in
	 * `sendEmail`'s signature and nowhere as a value reachable from this entry
	 * point, so `tsup`'s `treeshake: 'smallest'` dropped its runtime code while
	 * `dts: true` still emitted `email/enums/emailEngineTypeEnum.d.ts`. The
	 * result was a declaration promising a value the package did not ship —
	 * nothing could import it, from the root (not exported) or by path (no
	 * `.js`).
	 *
	 * The library's own routing was never affected, because the minifier
	 * inlined the member comparison to a string literal inside the bundle. The
	 * breakage was entirely on the consumer side.
	 *
	 * Exporting it here makes it reachable at runtime. Prefer passing a plain
	 * `'GMAIL'` / `'CUSTOM_SMTP'` string — `EmailEngineType` accepts both — but
	 * the enum is available for anyone who wants it.
	 */
	EmailEngineTypeEnum
};

export type {IConfig} from "./configuration/interface/config";
export type {IBloomsightError} from "./b2/error";
export type {EmailEngineType} from "./email/enums/emailEngineTypeEnum";
