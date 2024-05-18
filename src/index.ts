import {initPlatform} from "./platform/platform";
import {initUser} from "./user/user";
import {initSession} from "./session/session";
import {pageViewObserver} from "./event/page-view-event";
import {IConfig} from "./configuration/interface/config";
import {config, initConfig, isConfiguredProperly} from "./configuration/configuration";

import {resolveSimpleEvent} from './event/simple-event';
import {resolveDataEvent} from './event/data-event';
import {sendEmail} from "./email/email";
import {validateProperty} from "./property/property";
import {isBrowser, resolveHost} from "./utils/browser-api";

function init(appConfig: IConfig): void {

	if (!isConfiguredProperly(appConfig)) {
		console.error('bloomsight.js: propertyToken, isDevelopmentMode are mandatory parameters');
		return;
	}

	initConfig(appConfig);

	validateProperty(config.propertyToken, resolveHost())
		.then((isValid: boolean): void => {

			if (!isValid) {
				console.error(`bloomsight.js: propertyToken is not valid for ${resolveHost()}`);
				config.stopAll = true;
			} else {
				config.stopAll = false;
			}

			initPlatform();
			initUser();
			initSession();
		})
		.catch((error: string): void => {
			console.error(error)
		})
}

if (isBrowser()) {
	(window as any).init = init;
	(window as any).resolveSimpleEvent = resolveSimpleEvent;
	(window as any).resolveDataEvent = resolveDataEvent;
	(window as any).pageViewObserver = pageViewObserver;
	(window as any).sendEmail = sendEmail;
}

export {
	init,
	resolveSimpleEvent,
	resolveDataEvent,
	pageViewObserver,
	sendEmail
};

