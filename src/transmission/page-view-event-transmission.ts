import {executePostPayload} from "./transmission";
import {IPageViewEventData} from "../event/interface/page-view-event-payload";
import {ADD_PAGE_VIEW_EVENT_API, HTTP_HEADERS} from "../support/request-mapper";
import {ITransmissionResponse} from "./interface/transmission-response";

export function logPageViewEvent(
	payload: IPageViewEventData,
	onPreExecute: () => void,
	onPostExecute: (response: ITransmissionResponse) => void,
	onSuccess: (response: ITransmissionResponse) => void,
	onFailure: (error: string) => void,
	onComplete: () => void,
): void {

	executePostPayload<IPageViewEventData>(
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
