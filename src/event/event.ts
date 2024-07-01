import {retrieve, store} from "../utils/local-storage";

const EVENT_LIST_KEY: string = 'eventList';

export function storeEventList(eventList: string[]): void {
	store(EVENT_LIST_KEY, JSON.stringify(eventList));
}

export function retrieveEventList(): string[] {
	if (retrieve(EVENT_LIST_KEY) === '') return [];
	return JSON.parse(retrieve(EVENT_LIST_KEY));
}
