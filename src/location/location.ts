import {hasKey, retrieve, store} from "../utils/session-storage";
import {ILocationInfo} from "./interface/location-info";
import {isDevelopmentMode} from "../configuration/configuration";
import {resolveLocation} from "../transmission/location-transmission";

const LOCATION_IP_KEY: string = 'ip';
const LOCATION_CITY_KEY: string = 'city';
const LOCATION_REGION_KEY: string = 'region';
const LOCATION_COUNTRY_KEY: string = 'country';

export function initLocation(callback: () => void): void {

	if (isLocationMetaDataAvailableForCurrentSession()) {

		if (isDevelopmentMode()) {
			console.log(`ip: ${retrieve(LOCATION_IP_KEY)}`);
			console.log(`city: ${retrieve(LOCATION_CITY_KEY)}`);
			console.log(`region: ${retrieve(LOCATION_REGION_KEY)}`);
			console.log(`country: ${retrieve(LOCATION_COUNTRY_KEY)}`);
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
	store(LOCATION_IP_KEY, info.ip);
	store(LOCATION_CITY_KEY, info.city);
	store(LOCATION_REGION_KEY, info.region);
	store(LOCATION_COUNTRY_KEY, info.country);

	if (!isDevelopmentMode()) return;

	console.log(`ip: ${info.ip}`);
	console.log(`city: ${info.city}`);
	console.log(`region: ${info.region}`);
	console.log(`country: ${info.country}`);
}

function isLocationMetaDataAvailableForCurrentSession(): boolean {
	return hasKey(LOCATION_IP_KEY) &&
		hasKey(LOCATION_CITY_KEY) &&
		hasKey(LOCATION_REGION_KEY) &&
		hasKey(LOCATION_COUNTRY_KEY);
}

export function resolveIPAddress(): string {
	return retrieve(LOCATION_IP_KEY);
}

export function resolveCountry(): string {
	return retrieve(LOCATION_COUNTRY_KEY);
}

export function resolveRegion(): string {
	return retrieve(LOCATION_REGION_KEY);
}

export function resolveCity(): string {
	return retrieve(LOCATION_CITY_KEY);
}
