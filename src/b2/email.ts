/**
 * Email on blooms.ai — chosen by `configureEmail({ target: 'blooms-ai' })`, never
 * by the events `target`. MIGRATION.md, "Moving email".
 *
 * Same multipart body as the standalone server, posted to the native endpoint.
 * The engine type is not sent: blooms.ai runs Gmail and SMTP through one
 * pipeline. No `keepalive` — its 64 KB body cap would drop attachments.
 */
import {isBrowser} from '../utils/browser-api';
import {config} from '../configuration/configuration';
import {IBloomsightError, reportError} from './error';
import {emailErrorHandler, isEmailDebug, resolveEmailApiBase} from '../email/email-config';

export function emailSendApi(): string {
	return `${resolveEmailApiBase()}/api/bloomsight/email/send`;
}

export function transferEmailB2(payload: FormData, onSuccess: () => void, onError: () => void): void {
	if (config?.logOnly) return;
	if (!isBrowser()) return;

	const url: string = emailSendApi();
	const fail = (error: IBloomsightError): void => {
		reportError(error, {onError: emailErrorHandler(), debug: isEmailDebug()});
		onError();
	};

	fetch(url, {method: 'POST', body: payload})
		.then(async (response: Response): Promise<void> => {
			let body: {success?: boolean; message?: string; code?: string} | null = null;
			try { body = await response.json(); } catch { body = null; }
			if (response.ok && body?.success === true) {
				if (isEmailDebug()) console.log('bloomsight.js [blooms-ai]: email sent', body);
				onSuccess();
				return;
			}
			fail({
				code: body?.code || (body ? 'EMAIL_REJECTED' : 'BAD_RESPONSE'),
				message: body?.message || `email was not accepted (HTTP ${response.status})`,
				status: response.status,
			});
		})
		.catch((cause: unknown): void => fail({
			code: 'NETWORK_FAILURE',
			message: `could not reach ${url} (${(cause as Error)?.message || 'network error'})`,
		}));
}
