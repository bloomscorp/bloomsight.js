import {initPlatform} from "./platform/platform";
import {initLocation} from "./location/location";
import {initUser} from "./user/user";
import {initSession} from "./session/session";
import {initPageViewEventHandler} from "./event/page-view-event";
import {IConfig} from "./configuration/interface/config";
import {initConfig} from "./configuration/configuration";

import {resolveSimpleEvent} from './event/simple-event';
import {resolveDataEvent} from './event/data-event';
import {pageViewObserver} from './event/page-view-event';
import {sendEmail} from "./email/email";

function init(appConfig: IConfig): void {
	initConfig(appConfig);

	initLocation((): void => {
			initPlatform();
			initUser();
			initSession();

			if (appConfig.observePageViaWebAPI) {
				initPageViewEventHandler();
			}
		}
	);
}

(window as any).init = init;
(window as any).resolveSimpleEvent = resolveSimpleEvent;
(window as any).resolveDataEvent = resolveDataEvent;
(window as any).pageViewObserver = pageViewObserver;
(window as any).sendEmail = sendEmail;


export {
	init,
	resolveSimpleEvent,
	resolveDataEvent,
	pageViewObserver,
	sendEmail
};

