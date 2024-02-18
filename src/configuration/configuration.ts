import {IConfig} from "./interface/config";

export let config: IConfig | null = null;

export function initConfig(appConfig: IConfig): void {
	config = appConfig
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
