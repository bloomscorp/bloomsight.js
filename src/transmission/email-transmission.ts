import {ITransmissionResponse} from "./interface/transmission-response";
import {executePostPayload} from "./transmission";
import {GMAIL_EMAIL_TRANSFER_API, SMTP_EMAIL_TRANSFER_API} from "../support/request-mapper";
import {config} from "../configuration/configuration";
import {EmailEngineTypeEnum} from "../email/enums/emailEngineTypeEnum";

export function transferEmail(
	payload: any,
	emailService: EmailEngineTypeEnum,
	onPreExecute: () => void,
	onPostExecute: (response: ITransmissionResponse) => void,
	onSuccess: (response: ITransmissionResponse) => void,
	onFailure: (error: string) => void,
	onComplete: () => void,
): void {

	if (config?.logOnly) return;

	executePostPayload<FormData>(
		emailService === EmailEngineTypeEnum.GMAIL ? GMAIL_EMAIL_TRANSFER_API : SMTP_EMAIL_TRANSFER_API,
		payload,
		undefined,
		onPreExecute,
		onPostExecute,
		onSuccess,
		onFailure,
		onComplete
	);

}
