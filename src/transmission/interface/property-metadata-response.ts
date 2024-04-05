import {ITransmissionResponse} from "./transmission-response";
import {IPropertyMetadata} from "../../property/interface/property-metadata";

export interface PropertyMetadataResponse extends ITransmissionResponse {
	property: IPropertyMetadata
}
