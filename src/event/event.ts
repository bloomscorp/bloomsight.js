import {retrieveFromLocalStore, storeInLocalStore} from "../utils/local-storage";

const EVENT_LIST_KEY: string = 'bs-event-list';

export function storeEventList(eventList: string[]): void {
	storeInLocalStore(EVENT_LIST_KEY, JSON.stringify(eventList));
}

export function retrieveEventList(): string[] {
	if (retrieveFromLocalStore(EVENT_LIST_KEY) === '') return [];
	return JSON.parse(retrieveFromLocalStore(EVENT_LIST_KEY));
}
