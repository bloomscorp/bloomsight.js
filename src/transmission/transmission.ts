import {ITransmissionResponse} from "./interface/transmission-response";
import {isEmptyString} from "bmx-pastebox";
import {RESOURCE_VALIDATION_ERROR} from "../support/message";

export function executeBasicGet<T>(
	url: string,
	headers: Headers | undefined,
	onPreExecute: () => void,
	onPostExecute: (response: string) => void,
	onSuccess: (response: string) => void,
	onFailure: (error: string) => void,
	onComplete: () => void,
): void {

	onPreExecute();

	fetch(url, {
		method: 'GET',
		headers,
	})
		.then((response: Response) => response.json() as PromiseLike<ITransmissionResponse>)
		.then(
			(response: ITransmissionResponse): void => {
				onPostExecute(response.message);
				if (response.success) onSuccess(response.message);
				else onFailure(RESOURCE_VALIDATION_ERROR);
			}
		)
		.catch(
			(error): void => onFailure(error.toString())
		)
		.finally(
			(): void => onComplete()
		);
}

export function executePostPayload<T>(
	url: string,
	payload: T,
	headers: Headers | undefined,
	onPreExecute: () => void,
	onPostExecute: (response: ITransmissionResponse) => void,
	onSuccess: (response: ITransmissionResponse) => void,
	onFailure: (error: string) => void,
	onComplete: () => void,
): void {

	onPreExecute();

	fetch(url, {
		method: 'POST',
		headers,
		body: JSON.stringify(payload)
	})
		.then((response: Response) => response.json() as PromiseLike<ITransmissionResponse>)
		.then(
			(response: ITransmissionResponse): void => {
				onPostExecute(response);
				if (response.success) onSuccess(response);
				else onFailure(isEmptyString(response.message) ? RESOURCE_VALIDATION_ERROR : response.message);
			}
		)
		.catch(
			(error): void => onFailure(error.toString())
		)
		.finally(
			(): void => onComplete()
		);
}
