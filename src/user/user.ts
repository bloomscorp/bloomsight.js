import {retrieve, store} from "../utils/local-storage";
import {generateUserId} from "../utils/helper";
import {isDevelopmentMode} from "../configuration/configuration";

const USER_ID_KEY: string = "userId";
const NEW_USER_TENURE_IN_DAYS: number = 45;

export let isNewUser: boolean = false;
let activeUserId: string = '';

export function initUser(): void {
	initUserId();
}

function initUserId(): void {

	let isUserIdPresent: boolean = !!retrieve(USER_ID_KEY);

	if (isUserIdPresent) {
		activeUserId = retrieve(USER_ID_KEY);
	} else {
		activeUserId = generateUserId();
		storeUserId(activeUserId);
	}

	if (isDevelopmentMode()) {
		console.log(`active user id: ${activeUserId}`);
	}
}

function storeUserId(userId: string): void {
	store(USER_ID_KEY, userId);
}

function retrieveUserId(): string {
	return retrieve(USER_ID_KEY);
}

export function resolveUserId(): string {
	if (activeUserId) return activeUserId;
	else return retrieveUserId();
}

export function hasUserReturnedBeyondNewUserTenureLimit(sessionEndTimeInMilliseconds: number): boolean {
	const elapsedTimeAfterSessionExpiredInMilliseconds: number = Date.now() - sessionEndTimeInMilliseconds;
	const allowedUserTenureInMilliseconds: number = NEW_USER_TENURE_IN_DAYS * (24 * 60 * 60 * 1000);

	return elapsedTimeAfterSessionExpiredInMilliseconds > allowedUserTenureInMilliseconds;
}

export function setUserStatus(isNew: boolean): void {
	isNewUser = isNew;
}
