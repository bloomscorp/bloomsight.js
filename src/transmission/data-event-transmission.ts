import {ITransmissionResponse} from "./interface/transmission-response";
import {executePostPayload} from "./transmission";
import {ADD_DATA_EVENT_API, HTTP_HEADERS} from "../support/request-mapper";
import {IDataEventPayload} from "../event/interface/data-event-payload";

export function logDataEvent(
	payload: IDataEventPayload,
	onPreExecute: () => void,
	onPostExecute: (response: ITransmissionResponse) => void,
	onSuccess: (response: ITransmissionResponse) => void,
	onFailure: (error: string) => void,
	onComplete: () => void,
): void {

	executePostPayload<IDataEventPayload>(
		ADD_DATA_EVENT_API,
		payload,
		HTTP_HEADERS,
		onPreExecute,
		onPostExecute,
		onSuccess,
		onFailure,
		onComplete
	);
}
