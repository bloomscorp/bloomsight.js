import {retrieve, store} from "../utils/session-storage";
import {ILocationInfo} from "./interface/location-info";
import {isDevelopmentMode} from "../configuration/configuration";
import {resolveLocation} from "../transmission/location-transmission";

const LOCATION_IP_KEY: string = 'ip';
const LOCATION_CITY_KEY: string = 'city';
const LOCATION_REGION_KEY: string = 'region';
const LOCATION_COUNTRY_KEY: string = 'country';

export function initLocation(): void {

	resolveLocation(
		(): void => {},
		(response: ILocationInfo): void => {},
		(response: ILocationInfo): void => {
			saveLocationInfoToSessionStorage(response);
		},
		(error: string): void => {
			if (isDevelopmentMode()) console.log(`Failed to resolve location: ${error}`)
		},
		(): void => {}
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
