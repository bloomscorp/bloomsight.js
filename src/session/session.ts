import {retrieve} from "../utils/local-storage";
import {storeEventList} from "../event/event";
import {setUserStatus} from "../user/user";
import {store} from "../utils/session-storage";

const SESSION_ID_KEY: string = "sessionEnd";
const SESSION_TENURE_IN_MINUTES: number = 30;
const SESSION_OBSERVER_COOLING_PERIOD_IN_MINUTES: number = 1;

let lastTriggerTimeInMilliseconds: number = Date.now();

export function initSession(): void {
	const lastSessionEndingTimeInMilliseconds: number = retrieveSessionEndTime();

	if (lastSessionEndingTimeInMilliseconds) {
		if (Date.now() > lastSessionEndingTimeInMilliseconds) {
			setUserStatus(lastSessionEndingTimeInMilliseconds);
			restartSession(true);
		} else {
			setUserStatus(0);
		}
	} else {
		setUserStatus(0);
		restartSession(true);
	}

	attachSessionObserver();
}

function attachSessionObserver(): void {
	window.addEventListener('keydown', () => throttle());
	window.addEventListener('mousemove', () => throttle());
	window.addEventListener('click', () => throttle());
	window.addEventListener('scroll', () => throttle());
	window.addEventListener('wheel', () => throttle());
}

function throttle(): void{
	const coolingPeriodEndTimeInMilliseconds: number = lastTriggerTimeInMilliseconds + (SESSION_OBSERVER_COOLING_PERIOD_IN_MINUTES * 60 * 1000);
	const elapsedTimeAfterLastTriggerHappenedInMilliseconds: number = coolingPeriodEndTimeInMilliseconds - Date.now();
	const hasReTriggerHappenedAfterCoolingPeriod: boolean = elapsedTimeAfterLastTriggerHappenedInMilliseconds < 0;

	if (hasReTriggerHappenedAfterCoolingPeriod) {
		updateSession();
		lastTriggerTimeInMilliseconds = Date.now();
	}
}

function updateSession(): void {
	const previousSessionEndingTimeInSeconds: number = retrieveSessionEndTime();

	if (Date.now() > previousSessionEndingTimeInSeconds) {
		setUserStatus(previousSessionEndingTimeInSeconds);
		restartSession(true);
	} else {
		restartSession(false);
	}
}

function restartSession(resetPreviousSessionData: boolean): void {
	storeSessionEndTime();
	resetPreviousSessionData && resetSessionData();
}

function resetSessionData(): void {
	storeEventList([]);
}

function retrieveSessionEndTime(): number {
	return +retrieve(SESSION_ID_KEY);
}

function storeSessionEndTime(): void {
	store(
		SESSION_ID_KEY,
		JSON.stringify(Date.now() + (SESSION_TENURE_IN_MINUTES * 60 * 1000))
	);
}
