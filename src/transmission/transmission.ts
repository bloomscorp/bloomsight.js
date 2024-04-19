import {ITransmissionResponse} from "./interface/transmission-response";
import {isEmptyString} from "bmx-pastebox";
import {RESOURCE_VALIDATION_ERROR} from "../support/message";
import {isBrowser} from "../utils/browser-api";

export function executeBasicGet(
	url: string,
	headers: Headers | undefined,
	onPreExecute: () => void,
	onPostExecute: (response: string) => void,
	onSuccess: (response: string) => void,
	onFailure: (error: string) => void,
	onComplete: () => void,
): void {

	if (!isBrowser()) return;

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

export function executeGetPayload<T extends ITransmissionResponse, S>(
	url: string,
	headers: Headers | undefined,
	onPreExecute: () => void,
	onPostExecute: (response: S) => void,
	onSuccess: (response: S) => void,
	onFailure: (error: string) => void,
	onComplete: () => void,
	payloadKey: string
): void {

	if (!isBrowser()) return;

	onPreExecute();

	fetch(url, {
		method: 'GET',
		headers,
	})
		.then((response: Response) => response.json() as PromiseLike<T>)
		.then(
			(response: T): void => {
				onPostExecute(response[payloadKey]);
				if (response.success) onSuccess(response[payloadKey]);
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

export function executePostPayload<T>(
	url: string,
	payload: T | FormData,
	headers: Headers | undefined,
	onPreExecute: () => void,
	onPostExecute: (response: ITransmissionResponse) => void,
	onSuccess: (response: ITransmissionResponse) => void,
	onFailure: (error: string) => void,
	onComplete: () => void,
): void {

	if (!isBrowser()) return;

	onPreExecute();

	const requestOptions: RequestInit = {
		method: 'POST',
		headers: headers,
	};

	if (payload instanceof FormData) {
		requestOptions.body = payload;
	} else {
		requestOptions.body = JSON.stringify(payload);
		requestOptions.headers = {
			...requestOptions.headers,
			'Content-Type': 'application/json',
		};
	}

	fetch(url, requestOptions)
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
