import {ISimpleEventPayload} from "./interface/simple-event-payload";
import {ITransmissionResponse} from "../transmission/interface/transmission-response";
import {resolveBrowser, resolveDevice, resolveOS} from "../platform/platform";
import {config, isDevelopmentMode, resolvePropertyToken} from "../configuration/configuration";
import {resolveCity, resolveCountry, resolveIPAddress, resolveRegion} from "../location/location";
import {logSimpleEvent} from "../transmission/simple-event-transmission";
import {isBot} from "../utils/bot-handler";
import {resolveUserId} from "../user/user";

export function resolveSimpleEvent(
	eventToken: string,
): void {

	if (isBot()) config!.stopAll = true;

	if (config?.stopAll || config?.stopSimpleEvent) return;

	const payload: ISimpleEventPayload = {
		property: resolvePropertyToken(),
		simpleEventToken: eventToken,
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
		url: window.location.href || ''
	};

	if (isDevelopmentMode())
		console.log(`Simple event data: ${payload}`);

	logSimpleEvent(
		payload,
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
