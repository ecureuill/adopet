import {ErrorObject}  from 'ajv';

export class JSONSchemaValidatorError extends Error {
	ajvError: ErrorObject;

	constructor(errorObject: ErrorObject[], data: 'body' | 'params' | 'query'){
		super(`Invalid ${data}`);

		this.ajvError = errorObject[0];
		this.name = `${this.ajvError.keyword} Schema Error`;
		console.debug(errorObject);
	}
	
	// Object.setPrototypeOf(this, JSONSchemaValidatorError.prototype);

}