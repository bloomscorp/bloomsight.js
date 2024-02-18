import {initPlatform} from "./platform/platform";
import {initLocation} from "./location/location";
import {isConfiguredProperly} from "./configuration/configuration";
import {initUser} from "./user/user";
import {initSession} from "./session/session";

(function init(): void {

	if (!isConfiguredProperly()) {
		console.log(`provide valid bloomsight configuration!`);
		return;
	}

	initPlatform();
	initLocation();
	initUser();
	initSession();
})();
