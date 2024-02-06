import {TransmissionResponse} from "./interface/transmission-response";

export function executePostPayload<T>(
	url: string,
	payload: T,
	headers: Headers | undefined,
	onPreExecute: () => void,
	onPostExecute: (response: TransmissionResponse) => void,
	onSuccess: (response: TransmissionResponse) => void,
	onFailure: (error: string) => void,
	onComplete: () => void,
): void {

	onPreExecute();

	fetch(url, {
		method: 'POST',
		headers,
		body: JSON.stringify(payload)
	})
		.then((response: Response) => response.json() as PromiseLike<TransmissionResponse>)
		.then(
			(response: TransmissionResponse): void => {
				onPostExecute(response);
				if (response.success) onSuccess(response);
			}
		)
		.catch(
			(error): void => onFailure(error.toString())
		)
		.finally(
			(): void => onComplete()
		);
}
