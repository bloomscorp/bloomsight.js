import { resolvePropertyMetadata } from "../transmission/property-transmission";
import { IPropertyMetadata } from "./interface/property-metadata";

function validateProperty(propertyToken: string, hostname: string): Promise<boolean> {
	return new Promise((resolve, reject): void => {
		resolvePropertyMetadata(
			propertyToken,
			(): void => {},
			(): void => {},
			(metadata: IPropertyMetadata): void => {
				resolve(metadata.name === hostname);
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
