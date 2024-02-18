import {retrieve, store} from "../utils/session-storage";
import {ILocationInfo} from "./interface/location-info";
import {isDevelopmentMode} from "../configuration/configuration";

export function init(): void {

	const locationInfo: ILocationInfo = {} as ILocationInfo // TODO: implement

	saveLocationInfoToSessionStorage(locationInfo);
}

function saveLocationInfoToSessionStorage(info: ILocationInfo): void {
	store('ip', info.ip);
	store('country', info.country);
	store('region', info.region);
	store('city', info.city);

	if (!isDevelopmentMode()) return;

	console.log(`ip: ${info.ip}`);
	console.log(`city: ${info.city}`);
	console.log(`region: ${info.region}`);
	console.log(`country: ${info.country}`);
}

export function resolveIPAddress(): string {
	return retrieve('ip');
}

export function resolveCountry(): string {
	return retrieve('country');
}

export function resolveRegion(): string {
	return retrieve('region');
}

export function resolveCity(): string {
	return retrieve('city');
}
