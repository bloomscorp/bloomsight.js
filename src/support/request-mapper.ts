const BASE_URL: string = 'https://api.bloomsight.io/api/v1';
export const LOCATION_API: string = 'https://api.bloomsight.io/service/get-my-ip';
export const GET_PROPERTY_API: string = BASE_URL + '/property/get/{propertyToken}';
export const ADD_SIMPLE_EVENT_API: string = BASE_URL + '/simple-event-data/add';
export const ADD_DATA_EVENT_API: string = BASE_URL + '/data-event-data/add';
export const ADD_PAGE_VIEW_EVENT_API: string = BASE_URL + '/page-view-data/add';
export const EMAIL_TRANSFER_API: string = BASE_URL + '/email-notifier/gmail/send';


export const HTTP_HEADERS: Headers = new Headers({
	'Content-Type': 'application/json'
})
