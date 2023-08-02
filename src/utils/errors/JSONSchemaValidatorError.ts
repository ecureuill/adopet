import {ErrorObject}  from 'ajv';
import BaseError from './BaseError';
import { HTTP_RESPONSE } from '../consts';

export default class JSONSchemaValidatorError extends BaseError {
	constructor(errorObject: ErrorObject[], data: 'body' | 'params' | 'query'){
		super(`Invalid ${data}\n${errorObject[0].instancePath} ${errorObject[0].message}`);

		this.name = `${errorObject[0].keyword} Schema Error`;
		this.statusCode = HTTP_RESPONSE.BadRequest;
		this.params = errorObject[0].params;
		
		Object.setPrototypeOf(this, JSONSchemaValidatorError.prototype);
	}
}