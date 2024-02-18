import {isDevelopmentMode, resolvePropertyToken} from "../configuration/configuration";
import {resolveCity, resolveCountry, resolveIPAddress, resolveRegion} from "../location/location";
import {resolveBrowser, resolveDevice, resolveOS} from "../platform/platform";
import {executePostPayload} from "../transmission/transmission";
import {HTTP_HEADERS, ADD_PAGE_VIEW_EVENT_API} from "../support/request-mapper";
import {ITransmissionResponse} from "../transmission/interface/transmission-response";
import {IPageViewEventData} from "./interface/page-view-event-payload";
import {IUTMData} from "./interface/utm-data";
import {store} from "../utils/session-storage";

export function trigger(
	utmInfo: IUTMData
): void {

	const payload: IPageViewEventData = {
		property: resolvePropertyToken(),
		userId: "",
		referredUrl: '',
		ipAddress: resolveIPAddress(),
		city: resolveCity(),
		countryCode: resolveCountry(),
		region: resolveRegion(),
		browserName: resolveBrowser(),
		osName: resolveOS(),
		deviceType: resolveDevice(),
		url: window.location.href || '',
		title: document.title || '',
		utmCampaign: utmInfo.utmCampaign,
		utmContent: utmInfo.utmContent,
		utmMedium: utmInfo.utmMedium,
		utmSource: utmInfo.utmSource,
		utmTerm: utmInfo.utmTerm
	};

	if (isDevelopmentMode())
		console.log(`Page view data: ${payload}`);

	executePostPayload<IPageViewEventData>(
		ADD_PAGE_VIEW_EVENT_API,
		payload,
		HTTP_HEADERS,
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
			store('startUrl', window.location.href);
		}
	);
}
