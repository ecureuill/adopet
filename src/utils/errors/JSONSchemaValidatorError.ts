import {ErrorObject}  from 'ajv';
import BaseError from './BaseError';
import { HTTP_RESPONSE } from '../consts';

export default class JSONSchemaValidatorError extends BaseError {
	ajvError: ErrorObject;

	constructor(errorObject: ErrorObject[], data: 'body' | 'params' | 'query'){
		super(`Invalid ${data}`);

		this.ajvError = errorObject[0];
		this.name = `${this.ajvError.keyword} Schema Error`;
		this.message = `${this.ajvError.instancePath} ${this.ajvError.message}`;
		this.statusCode = HTTP_RESPONSE.BadRequest;
		Object.setPrototypeOf(this, JSONSchemaValidatorError.prototype);
	}
}