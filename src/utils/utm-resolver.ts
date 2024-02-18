import {IUTMData} from "../event/interface/utm-data";

const UTM_CAMPAIGN_KEY: string = 'utm_campaign';
const UTM_CONTENT_KEY: string = 'utm_content';
const UTM_MEDIUM_KEY: string = 'utm_medium';
const UTM_SOURCE_KEY: string = 'utm_source';
const UTM_TERM_KEY: string = 'utm_term';

export function resolveUTMData(url: string): IUTMData {

	const searchParams: URLSearchParams = new URLSearchParams(url);

	return {
		utmCampaign: searchParams.get(UTM_CAMPAIGN_KEY) || '',
		utmContent: searchParams.get(UTM_CONTENT_KEY) || '',
		utmMedium: searchParams.get(UTM_MEDIUM_KEY) || '',
		utmSource: searchParams.get(UTM_SOURCE_KEY) || '',
		utmTerm: searchParams.get(UTM_TERM_KEY) || ''
	}
}
