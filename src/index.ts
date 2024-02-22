import {initPlatform} from "./platform/platform";
import {initLocation} from "./location/location";
import {initUser} from "./user/user";
import {initSession} from "./session/session";
import {initPageViewEventHandler} from "./event/page-view-event";
import {IConfig} from "./configuration/interface/config";
import {initConfig} from "./configuration/configuration";

function init(appConfig: IConfig): void {
	initConfig(appConfig);

	initPlatform();
	initLocation();
	initUser();
	initSession();

	if (appConfig.observePageViaWebAPI) {
		initPageViewEventHandler();
	}
}

export {init};
export {resolveSimpleEvent} from './event/simple-event';
export {resolveDataEvent} from './event/data-event';
export {pageViewObserver} from './event/page-view-event';
