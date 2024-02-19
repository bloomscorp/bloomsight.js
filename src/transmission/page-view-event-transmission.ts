import {executePostPayload} from "./transmission";
import {IPageViewEventPayload} from "../event/interface/page-view-event-payload";
import {ADD_PAGE_VIEW_EVENT_API, HTTP_HEADERS} from "../support/request-mapper";
import {ITransmissionResponse} from "./interface/transmission-response";

export function logPageViewEvent(
	payload: IPageViewEventPayload,
	onPreExecute: () => void,
	onPostExecute: (response: ITransmissionResponse) => void,
	onSuccess: (response: ITransmissionResponse) => void,
	onFailure: (error: string) => void,
	onComplete: () => void,
): void {

	executePostPayload<IPageViewEventPayload>(
		ADD_PAGE_VIEW_EVENT_API,
		payload,
		HTTP_HEADERS,
		onPreExecute,
		onPostExecute,
		onSuccess,
		onFailure,
		onComplete
	);
}
