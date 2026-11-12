/**
 * Email on blooms.ai — chosen by `configureEmail({ target: 'blooms-ai' })`, never
 * by the events `target`. MIGRATION.md, "Moving email".
 *
 * Same multipart body as the standalone server, posted to the native endpoint.
 * The engine type is not sent: blooms.ai runs Gmail and SMTP through one
 * pipeline. No `keepalive` — its 64 KB body cap would drop attachments.
 *
 * Three fields serve blooms.ai's checks on keyless sends (blooms.ai
 * backend-sending.md §2.2.4). They are form fields, not headers, so the request
 * stays a simple one with no CORS preflight:
 *   bloomsightClient    this library's name and version
 *   bloomsightHp        the honeypot, when the site's form has a field of that name
 *   bloomsightBotToken  a Turnstile token, only when blooms.ai asked for one (428)
 */
import {isBrowser} from '../utils/browser-api';
import {config} from '../configuration/configuration';
import {IBloomsightError, reportError} from './error';
import {emailErrorHandler, isEmailDebug, resolveEmailApiBase} from '../email/email-config';
import {CLIENT_NAME} from './version';
import {getBotToken} from './bot-check';

/** A hidden field a site may add to its form: bots fill it, people never see it. */
export const HONEYPOT_FIELD: string = 'bloomsightHp';

export function emailSendApi(): string {
	return `${resolveEmailApiBase()}/api/bloomsight/email/send`;
}

interface ISendBody {success?: boolean; message?: string; code?: string; siteKey?: string}
interface IPosted {response: Response; body: ISendBody | null}

/** The body blooms.ai receives. A form value named `bloomsightHp` goes as its own field. */
function prepare(payload: FormData): FormData {
	const out: FormData = new FormData();
	payload.forEach((value: FormDataEntryValue, key: string): void => {
		if (key === `metadata[${HONEYPOT_FIELD}]`) out.append(HONEYPOT_FIELD, value);
		else out.append(key, value);
	});
	out.append('bloomsightClient', CLIENT_NAME);
	return out;
}

function withToken(payload: FormData, token: string): FormData {
	const out: FormData = new FormData();
	payload.forEach((value: FormDataEntryValue, key: string): void => out.append(key, value));
	out.append('bloomsightBotToken', token);
	return out;
}

async function post(url: string, body: FormData): Promise<IPosted> {
	const response: Response = await fetch(url, {method: 'POST', body});
	let parsed: ISendBody | null = null;
	try { parsed = await response.json(); } catch { parsed = null; }
	return {response, body: parsed};
}

export function transferEmailB2(payload: FormData, onSuccess: () => void, onError: () => void): void {
	if (config?.logOnly) return;
	if (!isBrowser()) return;

	const url: string = emailSendApi();
	const fail = (error: IBloomsightError): void => {
		reportError(error, {onError: emailErrorHandler(), debug: isEmailDebug()});
		onError();
	};
	const settle = ({response, body}: IPosted): void => {
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
	};

	const body: FormData = prepare(payload);

	post(url, body)
		.then(async (first: IPosted): Promise<void> => {
			// blooms.ai wants the bot check, and sent nothing: get a token from this
			// browser and repeat the send once with it.
			if (first.response.status === 428 && first.body?.code === 'BOT_CHECK_REQUIRED' && first.body.siteKey) {
				let token: string;
				try {
					token = await getBotToken(first.body.siteKey);
				} catch (cause) {
					fail({code: 'BOT_CHECK_FAILED', message: (cause as Error)?.message || 'the bot check failed', status: 428});
					return;
				}
				const second: IPosted = await post(url, withToken(body, token));
				if (second.response.status === 428) {
					fail({code: 'BOT_CHECK_FAILED', message: 'blooms.ai asked for the bot check again after it passed', status: 428});
					return;
				}
				settle(second);
				return;
			}
			settle(first);
		})
		.catch((cause: unknown): void => fail({
			code: 'NETWORK_FAILURE',
			message: `could not reach ${url} (${(cause as Error)?.message || 'network error'})`,
		}));
}
