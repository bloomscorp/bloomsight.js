import {config, isDevelopmentMode, resolvePropertyToken} from "../configuration/configuration";
import {resolveCity, resolveCountry, resolveIPAddress, resolveRegion} from "../location/location";
import {resolveBrowser, resolveDevice, resolveOS} from "../platform/platform";
import {IPageViewEventPayload} from "./interface/page-view-event-payload";
import {IUTMData} from "./interface/utm-data";
import {logPageViewEvent} from "../transmission/page-view-event-transmission";
import {ITransmissionResponse} from "../transmission/interface/transmission-response";
import {retrieve, store} from "../utils/session-storage";
import {resolveUTMData} from "../utils/utm-resolver";
import {isBot} from "../utils/bot-handler";
import {isNewUser, resolveUserId} from "../user/user";
import {retrieveEventList, storeEventList} from "./event";
import {resolveActiveUrl, resolveDocumentReferrer, resolveDocumentTitle, resolveWindow} from "../utils/browser-api";

const REFERRED_URL_KEY: string = 'startUrl';
const PAGEVIEW_EVENT: string = 'SITE_VISITED';

let _hasInitialPageViewOccurred: boolean = false;
let _debounce: boolean = false;

export function initPageViewEventHandler(): void {
	resolveWindow()?.addEventListener("load", () => pageViewObserver());
}

export function pageViewObserver(): void {
	if (!_hasInitialPageViewOccurred) {
		resolvePageViewEvent(
			true,
			resolveUTMData(resolveActiveUrl())
		);

		_hasInitialPageViewOccurred = true;
	} else {
		resolvePageViewEvent(
			false,
			resolveUTMData(resolveActiveUrl())
		);
	}
}

function resolveReferredUrlFromSession(isFirstPageViewOccurrence: boolean): string {
	return isFirstPageViewOccurrence ? resolveDocumentReferrer() : retrieve(REFERRED_URL_KEY);
}

export function resolvePageViewEvent(
	isFirstPageViewOccurrence: boolean,
	utmInfo: IUTMData
): void {

	if (isBot()) config!.stopAll = true;

	if (config?.stopAll || config?.stopPageViewEvent) return;

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
		url: resolveActiveUrl() || '',
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

	if (!isFirstPageViewOccurrence && !_debounce) {
		_debounce = true;
		payload.debounce = true;
	}

	if (isDevelopmentMode())
		console.log('page view data: ', payload);

	if (config?.logOnly)
		store('startUrl', resolveActiveUrl());

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
			store('startUrl', resolveActiveUrl());
		}
	);
}

