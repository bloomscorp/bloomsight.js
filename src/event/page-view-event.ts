import {config, isDevelopmentMode, isProperConfigProvided, resolvePropertyToken} from "../configuration/configuration";
import {initLocation, resolveCity, resolveCountry, resolveIPAddress, resolveRegion} from "../location/location";
import {resolveBrowser, resolveDevice, resolveOS} from "../platform/platform";
import {IPageViewEventPayload} from "./interface/page-view-event-payload";
import {IUTMData} from "./interface/utm-data";
import {logPageViewEvent} from "../transmission/page-view-event-transmission";
import {ITransmissionResponse} from "../transmission/interface/transmission-response";
import {retrieveFromSessionStore, storeInSessionStore} from "../utils/session-storage";
import {resolveUTMData} from "../utils/utm-resolver";
import {isBot} from "../utils/bot-handler";
import {isNewUser, resolveUserId} from "../user/user";
import {retrieveEventList, storeEventList} from "./event";
import {resolveActiveUrl, resolveDocumentReferrer, resolveDocumentTitle, resolveSegmentUrl} from "../utils/browser-api";
import {retrieveFromLocalStore, storeInLocalStore} from "../utils/local-storage";
import {SESSION_DEBOUNCE_TRACKER_KEY} from "../session/session";

const REFERRED_URL_KEY: string = 'bs-start-url';
const PAGEVIEW_EVENT: string = 'SITE_VISITED';

let pageViewCount: number = 0;

export function pageViewObserver(): void {
	// page view will be logged only after the user has spent 2+ seconds in the page
	setTimeout(
		() => initLocation((): void => {
			pageViewCount = parseInt(retrieveFromSessionStore("bs-page-views")) || 0;

			if (retrieveFromSessionStore("startUrl") == resolveActiveUrl()) pageViewCount = 0;

			resolvePageViewEvent(
				pageViewCount == 0,
				resolveUTMData(resolveActiveUrl())
			);
		}), 2000)
}

function resolveReferredUrlFromSession(isFirstPageViewOccurrence: boolean): string {
	return isFirstPageViewOccurrence ? resolveDocumentReferrer() : retrieveFromSessionStore(REFERRED_URL_KEY);
}

export function resolvePageViewEvent(
	isFirstPageViewOccurrence: boolean,
	utmInfo: IUTMData
): void {

	if (isBot()) config!.stopAll = true;

	if (!isProperConfigProvided) {
		console.error('bloomsight.js: propertyToken, isDevelopmentMode are mandatory parameters');
		return;
	}

	if (config?.stopAll || config?.stopPageViewEvent) {
		console.error('bloomsight.js: tracking page view event is disabled!')
		return;
	}

	const payload: IPageViewEventPayload = {
		property: resolvePropertyToken(),
		userId: resolveUserId(),
		referredUrl: resolveReferredUrlFromSession(isFirstPageViewOccurrence),
		ipAddress: resolveIPAddress(),
		city: resolveCity(),
		countryCode: resolveCountry(),
		region: resolveRegion(),
		browserName: resolveBrowser(),
		osName: resolveOS(),
		deviceType: resolveDevice(),
		url: resolveSegmentUrl() || '',
		title: resolveDocumentTitle() || '',
		utmCampaign: utmInfo.utmCampaign,
		utmContent: utmInfo.utmContent,
		utmMedium: utmInfo.utmMedium,
		utmSource: utmInfo.utmSource,
		utmTerm: utmInfo.utmTerm
	};

	// TODO: re-think this implementation
	const previouslyTriggeredEventList: string[] = retrieveEventList();

	if (!previouslyTriggeredEventList ||
		!previouslyTriggeredEventList.includes(PAGEVIEW_EVENT)
	) {
		if (isNewUser) {
			payload.newUser = true;
		} else {
			payload.returningUser = true;
		}

		payload.newSession = true;
		storeEventList([...previouslyTriggeredEventList, PAGEVIEW_EVENT]);
	}

	if (pageViewCount == 1 && !retrieveFromLocalStore(SESSION_DEBOUNCE_TRACKER_KEY)) {
		payload.debounce = true;
		storeInLocalStore(SESSION_DEBOUNCE_TRACKER_KEY, 'true');
	}

	if (isDevelopmentMode())
		console.log('page view data: ', payload);

	if (config?.logOnly) {
		storeInSessionStore('startUrl', resolveActiveUrl());
		storeInSessionStore("bs-page-views", (pageViewCount + 1).toString());
	}

	logPageViewEvent(
		payload,
		(): void => {
		},
		(response: ITransmissionResponse): void => {
		},
		(response: ITransmissionResponse): void => {
			if (isDevelopmentMode()) console.log(`page view event logged successfully`);
		},
		(error: string): void => {
			if (isDevelopmentMode()) console.log(`event log error: ${error}`);
		},
		(): void => {
			storeInSessionStore('startUrl', resolveActiveUrl());
			storeInSessionStore("bs-page-views", (pageViewCount + 1).toString());
		}
	);
}

