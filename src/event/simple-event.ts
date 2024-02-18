import {executePostPayload} from "../transmission/transmission";
import {HTTP_HEADERS, ADD_SIMPLE_EVENT_API} from "../support/request-mapper";
import {ISimpleEventData} from "./interface/simple-event-payload";
import {ITransmissionResponse} from "../transmission/interface/transmission-response";
import {resolveBrowser, resolveDevice, resolveOS} from "../platform/platform";
import {isDevelopmentMode, resolvePropertyToken} from "../configuration/configuration";
import {resolveCity, resolveCountry, resolveIPAddress, resolveRegion} from "../location/location";

export function trigger(
	eventToken: string,
): void {

	const payload: ISimpleEventData = {
		property: resolvePropertyToken(),
		simpleEventToken: eventToken,
		userId: "",
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
		url: window.location.href || ''
	};

	if (isDevelopmentMode())
		console.log(`Simple event data: ${payload}`);

	executePostPayload<ISimpleEventData>(
		ADD_SIMPLE_EVENT_API,
		payload,
		HTTP_HEADERS,
		(): void => {
		},
		(response: ITransmissionResponse): void => {
		},
		(response: ITransmissionResponse): void => {
			if (isDevelopmentMode()) console.log(`event ${eventToken} logged successfully`);
		},
		(error: string): void => {
			if (isDevelopmentMode()) console.log(`event log error: ${error}`);
		},
		(): void => {
		}
	);
}
