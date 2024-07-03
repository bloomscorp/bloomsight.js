import {removeKeyFromLocalStore, retrieveFromLocalStore, storeInLocalStore} from "../utils/local-storage";
import {retrieveFromSessionStore, storeInSessionStore} from "../utils/session-storage";
import {storeEventList} from "../event/event";
import {resolveWindow} from "../utils/browser-api";


const SESSION_LAST_ACTIVITY_KEY: string = "bs-session-last-activity";
const SESSION_EXPIRY_KEY: string = "bs-session-end";
const SESSION_ACTIVE_TABS_COUNT_KEY: string = "bs-active-tabs-count";
const SESSION_TAB_TRACKER_KEY: string = "bs-tab-tracked";
const SESSION_TENURE_IN_MINUTES: number = 30;
const SESSION_OBSERVER_COOLING_PERIOD_IN_MINUTES: number = 1;
export const SESSION_DEBOUNCE_TRACKER_KEY: string = "bs-debounce-tracked";

export let isNewSession: boolean = false;

export function initSession(): void {

	const lastSessionEndingTimeInMilliseconds: number = retrieveSessionExpiry();

	if (lastSessionEndingTimeInMilliseconds) {
		if (Date.now() > lastSessionEndingTimeInMilliseconds) {
			resetSession();
		} else {
			isNewSession = false;
		}
	} else {
		resetSession();
	}

	initSessionObserver();
}

function initSessionObserver(): void {

	resolveWindow()?.addEventListener('keydown', () => throttle());
	resolveWindow()?.addEventListener('mousemove', () => throttle());
	resolveWindow()?.addEventListener('click', () => throttle());
	resolveWindow()?.addEventListener('scroll', () => throttle());
	resolveWindow()?.addEventListener('wheel', () => throttle());

	tabRefreshHandler();
	tabOpenHandler();
	tabCloseHandler();
}

function throttle(): void {
	const lastTriggerTimeInMilliseconds: number = retrieveLastSessionActivity();
	const coolingPeriodEndTimeInMilliseconds: number = lastTriggerTimeInMilliseconds + (SESSION_OBSERVER_COOLING_PERIOD_IN_MINUTES * 60 * 1000);
	const elapsedTimeAfterLastTriggerHappenedInMilliseconds: number = coolingPeriodEndTimeInMilliseconds - Date.now();
	const hasReTriggerHappenedAfterCoolingPeriod: boolean = elapsedTimeAfterLastTriggerHappenedInMilliseconds < 0;

	if (hasReTriggerHappenedAfterCoolingPeriod) {
		updateSession();
	}
}

function updateSession(): void {
	if (isSessionExpired()) resetSession();
	setSessionData();
}

function tabRefreshHandler(): void {
	let tabCount: number = retrieveSessionActiveTabsCount();

	if (retrieveFromSessionStore(SESSION_TAB_TRACKER_KEY)) {
		tabCount++;
		storeSessionActiveTabsCount(tabCount);
	} else if (!retrieveFromSessionStore(SESSION_TAB_TRACKER_KEY) && tabCount <= 0) {
		resetSession();
	}
}

function tabCloseHandler(): void {
	resolveWindow()?.addEventListener('beforeunload', (event: BeforeUnloadEvent): void => {
		let tabCount: number = retrieveSessionActiveTabsCount() - 1;

		if (tabCount < 0) tabCount = 0;

		storeSessionActiveTabsCount(tabCount);
	});
}

function tabOpenHandler(): void {
	if (!retrieveFromSessionStore(SESSION_TAB_TRACKER_KEY)) {
		const tabCount: number = retrieveSessionActiveTabsCount() + 1;
		storeSessionActiveTabsCount(tabCount);
	}
}


function isSessionExpired(): boolean {
	const lastSessionEndingTimeInSeconds: number = retrieveSessionExpiry();
	return Date.now() > lastSessionEndingTimeInSeconds;
}


function resetSession(): void {
	storeEventList([]);
	removeKeyFromLocalStore(SESSION_DEBOUNCE_TRACKER_KEY);
	setSessionData();
	isNewSession = true;
}

function retrieveLastSessionActivity(): number {
	return +retrieveFromLocalStore(SESSION_LAST_ACTIVITY_KEY);
}

function retrieveSessionExpiry(): number {
	return +retrieveFromLocalStore(SESSION_EXPIRY_KEY);
}

export function retrieveSessionActiveTabsCount(): number {
	return +retrieveFromLocalStore(SESSION_ACTIVE_TABS_COUNT_KEY);
}

function storeSessionActiveTabsCount(count: number): void {
	storeInLocalStore(SESSION_ACTIVE_TABS_COUNT_KEY, JSON.stringify(count));
	storeInSessionStore(SESSION_TAB_TRACKER_KEY, 'true');
}

function setSessionData(): void {
	storeInLocalStore(SESSION_LAST_ACTIVITY_KEY, JSON.stringify(Date.now()));
	storeInLocalStore(
		SESSION_EXPIRY_KEY,
		JSON.stringify(Date.now() + (SESSION_TENURE_IN_MINUTES * 60 * 1000))
	);
}
