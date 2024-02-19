import {IConfig} from "./interface/config";

export let config: IConfig | null = null;

const defaultConfig: Partial<IConfig> = {
	stopSimpleEvent: false,
	stopDataEvent: false,
	stopPageViewEvent: false,
	stopAll: false
}

export function initConfig(appConfig: IConfig): void {
	config = {...defaultConfig, ...appConfig};
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
