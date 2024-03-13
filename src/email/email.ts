import {resolveBrowser, resolveDevice, resolveOS} from "../platform/platform";
import {resolveCity, resolveCountry, resolveIPAddress, resolveRegion} from "../location/location";
import {isDevelopmentMode} from "../configuration/configuration";
import {transferEmail} from "../transmission/email-transmission";
import {ITransmissionResponse} from "../transmission/interface/transmission-response";

export function sendEmail(
	engineId: string,
	templateId: string,
	templateOwnerId: string,
	emailMetaData: FormData
): void {

	let payload: FormData = new FormData();

	payload.append('engineId', engineId);
	payload.append('userId', templateOwnerId);
	payload.append('templateId', templateId);

	payload.append(`senderInfo['deviceType']`, resolveDevice());
	payload.append(`senderInfo['osName']`, resolveOS());
	payload.append(`senderInfo['browserName']`, resolveBrowser());
	payload.append(`senderInfo['ipAddress']`, resolveIPAddress());
	payload.append(`senderInfo['countryCode']`, resolveCountry());
	payload.append(`senderInfo['region']`, resolveRegion());
	payload.append(`senderInfo['city']`, resolveCity());
	payload.append(`senderInfo['url']`, window.location.href);

	emailMetaData.forEach((item: FormDataEntryValue, key: string) => {
		payload.append(`metadata[${key}]`, item);
	});

	if (isDevelopmentMode()) {
		console.log('email data: ', payload);
	}

	transferEmail(
		payload,
		(): void => {
		},
		(response: ITransmissionResponse): void => {
		},
		(response: ITransmissionResponse): void => {
			if (isDevelopmentMode()) console.log(`email sent successfully`);
		},
		(error: string): void => {
			if (isDevelopmentMode()) console.log(`email sending error: ${error}`);
		},
		(): void => {
		}
	);
}
