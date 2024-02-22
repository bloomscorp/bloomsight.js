export interface IConfig {
	propertyToken: string;
	isDevelopmentMode: boolean;
	observePageViaWebAPI?: boolean;
	stopSimpleEvent?: boolean;
	stopDataEvent?: boolean;
	stopPageViewEvent?: boolean;
	stopAll?: boolean;
	logOnly?: boolean;
}

