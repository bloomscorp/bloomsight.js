export interface IPageViewEventPayload {
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
	browserVersion: string;
	osName: string;
	deviceType: string;
	isDesktopModeEnabled: boolean;
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
