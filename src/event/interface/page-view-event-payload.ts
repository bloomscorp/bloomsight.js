export interface IPageViewEventData {
	property: string;
	url: string;
	title: string;
	referredUrl: string;
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
	debounce?: boolean;
	utmSource: string;
	utmMedium: string;
	utmCampaign: string;
	utmTerm: string;
	utmContent: string;
}
