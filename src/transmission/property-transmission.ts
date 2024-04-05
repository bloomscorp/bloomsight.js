import {executeGetPayload} from "./transmission";
import {GET_PROPERTY_API, HTTP_HEADERS} from "../support/request-mapper";
import {PropertyMetadataResponse} from "./interface/property-metadata-response";
import {IPropertyMetadata} from "../property/interface/property-metadata";

export function resolvePropertyMetadata(
	propertyToken: string,
	onPreExecute: () => void,
	onPostExecute: (response: IPropertyMetadata) => void,
	onSuccess: (response: IPropertyMetadata) => void,
	onFailure: (error: string) => void,
	onComplete: () => void,
): void {

	executeGetPayload<PropertyMetadataResponse, IPropertyMetadata>(
		GET_PROPERTY_API.replace("{propertyToken}", propertyToken),
		HTTP_HEADERS,
		onPreExecute,
		onPostExecute,
		onSuccess,
		onFailure,
		onComplete,
		"property"
	);
}
