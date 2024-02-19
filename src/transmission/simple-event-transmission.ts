import {ITransmissionResponse} from "./interface/transmission-response";
import {executePostPayload} from "./transmission";
import {ADD_SIMPLE_EVENT_API, HTTP_HEADERS} from "../support/request-mapper";
import {ISimpleEventPayload} from "../event/interface/simple-event-payload";

export function logSimpleEvent(
	payload: ISimpleEventPayload,
	onPreExecute: () => void,
	onPostExecute: (response: ITransmissionResponse) => void,
	onSuccess: (response: ITransmissionResponse) => void,
	onFailure: (error: string) => void,
	onComplete: () => void,
): void {

	executePostPayload<ISimpleEventPayload>(
		ADD_SIMPLE_EVENT_API,
		payload,
		HTTP_HEADERS,
		onPreExecute,
		onPostExecute,
		onSuccess,
		onFailure,
		onComplete
	);
}
