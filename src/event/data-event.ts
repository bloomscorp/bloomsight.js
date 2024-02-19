import {isBot} from "../utils/bot-handler";
import {config, isDevelopmentMode, resolvePropertyToken} from "../configuration/configuration";
import {resolveCity, resolveCountry, resolveIPAddress, resolveRegion} from "../location/location";
import {resolveBrowser, resolveDevice, resolveOS} from "../platform/platform";
import {ITransmissionResponse} from "../transmission/interface/transmission-response";
import {IDataEventPayload} from "./interface/data-event-payload";
import {logDataEvent} from "../transmission/data-event-transmission";

export function resolveDataEvent(
	eventToken: string,
	eventData: { [key: string]: string }
): void {

	if (isBot()) config!.stopAll = true;

	if (config?.stopAll || config?.stopDataEvent) return;

	const payload: IDataEventPayload = {
		property: resolvePropertyToken(),
		dataEventToken: eventToken,
		eventLogData: eventData,
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
		url: window.location.href || '',
	};

	if (isDevelopmentMode())
		console.log(`Data event data: ${payload}`);

	logDataEvent(
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
