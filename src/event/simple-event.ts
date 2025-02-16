import {ISimpleEventPayload} from "./interface/simple-event-payload";
import {ITransmissionResponse} from "../transmission/interface/transmission-response";
import {isDesktopModeEnabled, resolveBrowser, resolveBrowserVersion, resolveDevice, resolveOS} from "../platform/platform";
import {config, isDevelopmentMode, isProperConfigProvided, resolvePropertyToken} from "../configuration/configuration";
import {resolveCity, resolveCountry, resolveIPAddress, resolveRegion} from "../location/location";
import {logSimpleEvent} from "../transmission/simple-event-transmission";
import {isBot} from "../utils/bot-handler";
import {isNewUser, resolveUserId} from "../user/user";
import {retrieveEventList, storeEventList} from "./event";
import {resolveSegmentUrl} from "../utils/browser-api";

export function resolveSimpleEvent(
	eventToken: string,
	label: string = ''
): void {

	if (isBot()) config!.stopAll = true;

	if (!isProperConfigProvided) {
		console.error('bloomsight.js: propertyToken, isDevelopmentMode are mandatory parameters');
		return;
	}

	if (config?.stopAll || config?.stopSimpleEvent) {
		console.error('bloomsight.js: tracking simple event is disabled!')
		return;
	}

	const payload: ISimpleEventPayload = {
		property: resolvePropertyToken(),
		simpleEventToken: eventToken,
		userId: resolveUserId(),
		ipAddress: resolveIPAddress(),
		city: resolveCity(),
		countryCode: resolveCountry(),
		region: resolveRegion(),
		browserName: resolveBrowser(),
		browserVersion: resolveBrowserVersion(),
		osName: resolveOS(),
		deviceType: resolveDevice(),
		isDesktopModeEnabled: isDesktopModeEnabled(),
		url: resolveSegmentUrl() || ''
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
		console.log('simple event data: ', payload);

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
