import { resolvePropertyMetadata } from "../transmission/property-transmission";
import { IPropertyMetadata } from "./interface/property-metadata";
import {isDevelopmentMode} from "../configuration/configuration";

function validateProperty(propertyToken: string, hostname: string): Promise<boolean> {
	return new Promise((resolve, reject): void => {
		resolvePropertyMetadata(
			propertyToken,
			(): void => {
				if (isDevelopmentMode()) resolve(true);
			},
			(): void => {},
			(metadata: IPropertyMetadata): void => {
				resolve(metadata.name.replace(/^www\./, '') === hostname.replace(/^www\./, ''));
			},
			(error: string): void => {
				reject('unable to validate bloomsight property token!');
			},
			(): void => {}
		);
	});
}

export {
	validateProperty
}
