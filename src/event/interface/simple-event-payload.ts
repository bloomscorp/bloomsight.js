export interface ISimpleEventData {
	property: string;
	simpleEventToken: string;
	userId: string;
	ipAddress: string;
	countryCode: string;
	region: string;
	city: string;
	browserName: string;
	osName: string;
	deviceType: string;
	newUser?: boolean;
	returningUser?: boolean;
	newSession?: boolean;
	url: string;
}
