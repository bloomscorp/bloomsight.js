import {executePostPayload} from "../transmission/transmission";
import {HTTP_HEADERS, SIMPLE_EVENT_API_URL} from "../support/request-mapper";
import {ISimpleEventData} from "./interface/simple-event-payload";
import {ITransmissionResponse} from "../transmission/interface/transmission-response";
import {resolveBrowser, resolveDevice, resolveOS} from "../platform/platform";
import {isDevelopmentMode, resolvePropertyToken} from "../configuration/configuration";
import {resolveCity, resolveCountry, resolveIPAddress, resolveRegion} from "../location/location";

export function trigger(
	simpleEventToken: string,
	url: string
): void {

	let payload: ISimpleEventData = {
		property: resolvePropertyToken(),
		simpleEventToken,
		url,
		userId: resolveUserId(),
		newUser: false,
		returningUser: false,
		newSession: false,
		ipAddress: resolveIPAddress(),
		city: resolveCity(),
		countryCode: resolveCountry(),
		region: resolveRegion(),
		browserName: resolveBrowser(),
		osName: resolveOS(),
		deviceType: resolveDevice(),
	};

	executePostPayload<ISimpleEventData>(
		SIMPLE_EVENT_API_URL,
		payload,
		HTTP_HEADERS,
		(): void => {
		},
		(response: ITransmissionResponse): void => {
		},
		(response: ITransmissionResponse): void => {
			if (isDevelopmentMode()) console.log(`event ${simpleEventToken} logged successfully`);
		},
		(error: string): void => {
			if (isDevelopmentMode()) console.log(`error: ${error}`);
		},
		(): void => {
		}
	);
}
