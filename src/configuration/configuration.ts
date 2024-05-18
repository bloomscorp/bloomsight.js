import {IConfig} from "./interface/config";

export let config: IConfig;
export let isProperConfigProvided: boolean = false;

const defaultConfig: Partial<IConfig> = {
	stopSimpleEvent: false,
	stopDataEvent: false,
	stopPageViewEvent: false,
	stopAll: false,
	logOnly: false,
}

export function isConfiguredProperly(appConfig: any): boolean {
	return (
		(appConfig.hasOwnProperty('propertyToken') && appConfig.propertyToken != '') &&
		appConfig.hasOwnProperty('isDevelopmentMode')
	);
}

export function initConfig(appConfig: IConfig): void {
	config = {...defaultConfig, ...appConfig};
	isProperConfigProvided = true;

	if (isDevelopmentMode()) {
		console.log('configuration: ', config);
	}
}

export function resolvePropertyToken(): string {
	return config ? config.propertyToken : '';
}

export function isDevelopmentMode(): boolean {
	return config ? config.isDevelopmentMode : false;
}
