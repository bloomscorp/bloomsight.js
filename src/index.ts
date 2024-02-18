import {initPlatform} from "./platform/platform";
import {initLocation} from "./location/location";
import {isConfiguredProperly} from "./configuration/configuration";

(function init(): void {

	if (!isConfiguredProperly()) {
		console.log(`provide valid bloomsight configuration!`);
		return;
	}

	initPlatform();
	initLocation();
})();
