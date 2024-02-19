import {config, isDevelopmentMode, resolvePropertyToken} from "../configuration/configuration";
import {resolveCity, resolveCountry, resolveIPAddress, resolveRegion} from "../location/location";
import {resolveBrowser, resolveDevice, resolveOS} from "../platform/platform";
import {IPageViewEventPayload} from "./interface/page-view-event-payload";
import {IUTMData} from "./interface/utm-data";
import {logPageViewEvent} from "../transmission/page-view-event-transmission";
import {ITransmissionResponse} from "../transmission/interface/transmission-response";
import {store} from "../utils/session-storage";
import {resolveUTMData} from "../utils/utm-resolver";
import {isBot} from "../utils/bot-handler";

export function initPageViewEventHandler(): void {
	window.addEventListener("load", (): void => {
		resolvePageViewEvent(
			resolveUTMData(window.location.href)
		);
	})
}

function resolvePageViewEvent(
	utmInfo: IUTMData
): void {

	if (isBot()) config!.stopAll = true;

	if (config?.stopAll || config?.stopPageViewEvent) return;

	const payload: IPageViewEventPayload = {
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
			store('startUrl', window.location.href);
		});
}
