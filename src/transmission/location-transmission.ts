import {executeGetPayload} from "./transmission";
import {HTTP_HEADERS, LOCATION_API} from "../support/request-mapper";
import {ILocationResponse} from "./interface/location-response";
import {ILocationInfo} from "../location/interface/location-info";

export function resolveLocation(
	onPreExecute: () => void,
	onPostExecute: (response: ILocationInfo) => void,
	onSuccess: (response: ILocationInfo) => void,
	onFailure: (error: string) => void,
	onComplete: () => void
): void {

	executeGetPayload<ILocationResponse, ILocationInfo>(
		LOCATION_API,
		HTTP_HEADERS,
		onPreExecute,
		onPostExecute,
		onSuccess,
		onFailure,
		onComplete,
		"information"
	);
}
