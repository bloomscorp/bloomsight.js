import {hasKeyInSessionStore, retrieveFromSessionStore, storeInSessionStore} from "../utils/session-storage";
import {ILocationInfo} from "./interface/location-info";
import {isDevelopmentMode} from "../configuration/configuration";
import {resolveLocation} from "../transmission/location-transmission";

const LOCATION_IP_KEY: string = 'bs-ip';
const LOCATION_CITY_KEY: string = 'bs-city';
const LOCATION_REGION_KEY: string = 'bs-region';
const LOCATION_COUNTRY_KEY: string = 'bs-country';

export function initLocation(callback: () => void): void {

	if (isLocationMetaDataAvailableForCurrentSession()) {

		if (isDevelopmentMode()) {
			console.log(`ip: ${retrieveFromSessionStore(LOCATION_IP_KEY)}`);
			console.log(`city: ${retrieveFromSessionStore(LOCATION_CITY_KEY)}`);
			console.log(`region: ${retrieveFromSessionStore(LOCATION_REGION_KEY)}`);
			console.log(`country: ${retrieveFromSessionStore(LOCATION_COUNTRY_KEY)}`);
		}

		callback();
		return;
	}

	resolveLocation(
		(): void => {
		},
		(response: ILocationInfo): void => {
		},
		(response: ILocationInfo): void => {
			saveLocationInfoToSessionStorage(response);
		},
		(error: string): void => {
			if (isDevelopmentMode()) console.log(`failed to resolve location: ${error}`)
		},
		(): void => {
			callback();
		}
	)
}

function saveLocationInfoToSessionStorage(info: ILocationInfo): void {
	storeInSessionStore(LOCATION_IP_KEY, info.ip);
	storeInSessionStore(LOCATION_CITY_KEY, info.city);
	storeInSessionStore(LOCATION_REGION_KEY, info.region);
	storeInSessionStore(LOCATION_COUNTRY_KEY, info.country);

	if (!isDevelopmentMode()) return;

	console.log(`ip: ${info.ip}`);
	console.log(`city: ${info.city}`);
	console.log(`region: ${info.region}`);
	console.log(`country: ${info.country}`);
}

function isLocationMetaDataAvailableForCurrentSession(): boolean {
	return hasKeyInSessionStore(LOCATION_IP_KEY) &&
		hasKeyInSessionStore(LOCATION_CITY_KEY) &&
		hasKeyInSessionStore(LOCATION_REGION_KEY) &&
		hasKeyInSessionStore(LOCATION_COUNTRY_KEY);
}

export function resolveIPAddress(): string {
	return retrieveFromSessionStore(LOCATION_IP_KEY);
}

export function resolveCountry(): string {
	return retrieveFromSessionStore(LOCATION_COUNTRY_KEY);
}

export function resolveRegion(): string {
	return retrieveFromSessionStore(LOCATION_REGION_KEY);
}

export function resolveCity(): string {
	return retrieveFromSessionStore(LOCATION_CITY_KEY);
}
