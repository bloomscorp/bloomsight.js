import {ITransmissionResponse} from "./interface/transmission-response";
import {executePostPayload} from "./transmission";
import {EMAIL_TRANSFER_API} from "../support/request-mapper";
import {config} from "../configuration/configuration";

export function transferEmail(
	payload: any,
	onPreExecute: () => void,
	onPostExecute: (response: ITransmissionResponse) => void,
	onSuccess: (response: ITransmissionResponse) => void,
	onFailure: (error: string) => void,
	onComplete: () => void,
): void {

	if (config?.logOnly) return;

	executePostPayload<FormData>(
		EMAIL_TRANSFER_API,
		payload,
		undefined,
		onPreExecute,
		onPostExecute,
		onSuccess,
		onFailure,
		onComplete
	);

}
