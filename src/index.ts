import {initPlatform} from "./platform/platform";
import {initLocation} from "./location/location";
import {initUser} from "./user/user";
import {initSession} from "./session/session";
import {initPageViewEventHandler, pageViewObserver} from "./event/page-view-event";
import {IConfig} from "./configuration/interface/config";
import {initConfig} from "./configuration/configuration";

import {resolveSimpleEvent} from './event/simple-event';
import {resolveDataEvent} from './event/data-event';
import {sendEmail} from "./email/email";
import {validateProperty} from "./property/property";
import {isBrowser, resolveHost} from "./utils/browser-api";

function init(appConfig: IConfig): void {

	initConfig(appConfig);

	validateProperty(appConfig.propertyToken, resolveHost())
		.then((isValid: boolean): void => {

			if (!isValid) {
				console.error(`propertyToken is not valid for ${resolveHost()}`);
				appConfig.stopAll = true;
			} else {
				appConfig.stopAll = false;
			}

			initLocation((): void => {
					initPlatform();
					initUser();
					initSession();

					if (appConfig.observePageViaWebAPI) {
						initPageViewEventHandler();
					}
				}
			);
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

