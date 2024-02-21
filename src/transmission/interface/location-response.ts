import {ITransmissionResponse} from "./transmission-response";
import {ILocationInfo} from "../../location/interface/location-info";

export interface ILocationResponse extends ITransmissionResponse {
	information: ILocationInfo;
}
