import {IConfig} from "./interface/config";

export let config: IConfig | null = null;

const defaultConfig: Partial<IConfig> = {
	stopSimpleEvent: false,
	stopDataEvent: false,
	stopPageViewEvent: false,
	stopAll: false,
	logOnly: false,
	observePageViaWebAPI: true
}

export function areMandatoryPropertyAvailable(appConfig: any): boolean {
	return (
		appConfig.hasOwnProperty('propertyToken') &&
		appConfig.hasOwnProperty('isDevelopmentMode')
	);
}

export function initConfig(appConfig: IConfig): IConfig {
	config = {...defaultConfig, ...appConfig};

	if (isDevelopmentMode()) {
		console.log('configuration: ', config);
	}

	return config;
}

export function isConfiguredProperly(): boolean {
	return !!resolvePropertyToken();
}

export function resolvePropertyToken(): string {
	return config ? config.propertyToken : '';
}

export function isDevelopmentMode(): boolean {
	return config ? config.isDevelopmentMode : false;
}
