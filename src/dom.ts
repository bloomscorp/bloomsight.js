/**
 * `bloomsight.dom.js` — the optional DOM helper, loaded as a second script tag
 * alongside the core CDN bundle.
 *
 * This used to be a hand-written file sitting in `umd/`, which no build step
 * produced and no typecheck ever saw, even though customer sites load it. It is
 * now a real entry point: `npm run bundle` emits both `umd/production.js` and
 * `umd/dom.js` from source.
 *
 * Same global name, same arguments, same console errors. One behavioural
 * difference, and it is a fix: the old version logged "element not found" and
 * then called `addEventListener` on `null` anyway, throwing a TypeError into the
 * customer's page. It now returns instead.
 */
import {isBrowser, resolveDocument, resolveWindow} from './utils/browser-api';

export function resolveDOM(
	targetSelector: string,
	eventHandler: (event: Event) => void
): void {

	if (!isBrowser()) return;

	const doesCoreModulePresent: boolean =
		Object.prototype.hasOwnProperty.call(resolveWindow(), 'resolveSimpleEvent');

	if (!doesCoreModulePresent)
		console.error('bloomsight.dom.js: core CDN library must be integrated first');

	const targetElement: Element | null = resolveDocument().querySelector(targetSelector);

	if (!targetElement) {
		console.error(`bloomsight.dom.js: element with selector ${targetSelector} not found in the DOM!`);
		return;
	}

	targetElement.addEventListener('click', eventHandler);
}

if (isBrowser()) {
	(window as any).resolveDOM = resolveDOM;
}
