import {isBot} from "../utils/bot-handler";
import {config, isDevelopmentMode, isProperConfigProvided, resolvePropertyToken} from "../configuration/configuration";
import {resolveCity, resolveCountry, resolveIPAddress, resolveRegion} from "../location/location";
import {resolveBrowser, resolveBrowserVersion, resolveDevice, resolveOS} from "../platform/platform";
import {ITransmissionResponse} from "../transmission/interface/transmission-response";
import {IDataEventPayload} from "./interface/data-event-payload";
import {logDataEvent} from "../transmission/data-event-transmission";
import {isNewUser, resolveUserId} from "../user/user";
import {retrieveEventList, storeEventList} from "./event";
import {resolveSegmentUrl} from "../utils/browser-api";

export function resolveDataEvent(
	eventToken: string,
	eventData: { [key: string]: any },
	label: string = ''
): void {

	if (isBot()) config!.stopAll = true;

	if (!isProperConfigProvided) {
		console.error('bloomsight.js: propertyToken, isDevelopmentMode are mandatory parameters');
		return;
	}

	if (config?.stopAll || config?.stopDataEvent) {
		console.error('bloomsight.js: tracking data event is disabled!')
		return;
	}

	const payload: IDataEventPayload = {
		property: resolvePropertyToken(),
		dataEventToken: eventToken,
		eventLogData: eventData,
		userId: resolveUserId(),
		ipAddress: resolveIPAddress(),
		city: resolveCity(),
		countryCode: resolveCountry(),
		region: resolveRegion(),
		browserName: resolveBrowser(),
		browserVersion: resolveBrowserVersion(),
		osName: resolveOS(),
		deviceType: resolveDevice(),
		url: resolveSegmentUrl() || '',
	};

	// TODO: re-think this implementation
	const previouslyTriggeredEventList: string[] = retrieveEventList();

	if (!previouslyTriggeredEventList ||
		!previouslyTriggeredEventList.includes(eventToken)
	) {
		if (isNewUser) {
			payload.newUser = true;
		} else {
			payload.returningUser = true;
		}

		payload.newSession = true;
		storeEventList([...previouslyTriggeredEventList, eventToken]);
	}

	if (isDevelopmentMode())
		console.log('data event data: ', payload);

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
