export interface ISimpleEventPayload {
	property: string;
	simpleEventToken: string;
	userId: string;
	ipAddress: string;
	countryCode: string;
	region: string;
	city: string;
	browserName: string;
	browserVersion: string;
	osName: string;
	deviceType: string;
	isDesktopModeEnabled: boolean;
	newUser?: boolean;
	returningUser?: boolean;
	newSession?: boolean;
	url: string;
}
