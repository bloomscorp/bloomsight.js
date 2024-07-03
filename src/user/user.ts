import {retrieveFromLocalStore, storeInLocalStore} from "../utils/local-storage";
import {generateUserId} from "../utils/helper";
import {isDevelopmentMode} from "../configuration/configuration";

const USER_ID_KEY: string = "bs-user-token";

export let isNewUser: boolean = false;
let activeUserId: string = '';

export function initUser(): void {
	initUserId();
}

function initUserId(): void {

	let isUserIdPresent: boolean = !!retrieveFromLocalStore(USER_ID_KEY);

	if (isUserIdPresent) {
		activeUserId = retrieveFromLocalStore(USER_ID_KEY);
		isNewUser = false;
	} else {
		activeUserId = generateUserId();
		isNewUser = true;
		storeUserId(activeUserId);
	}

	if (isDevelopmentMode()) {
		console.log(`active user id: ${activeUserId}`);
	}
}

function storeUserId(userId: string): void {
	storeInLocalStore(USER_ID_KEY, userId);
}

function retrieveUserId(): string {
	return retrieveFromLocalStore(USER_ID_KEY);
}

export function resolveUserId(): string {
	if (activeUserId) return activeUserId;
	else return retrieveUserId();
}

export function setUserStatus(isNew: boolean): void {
	isNewUser = isNew;
}
