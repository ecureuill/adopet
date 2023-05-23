import { HTTP_RESPONSE } from '../consts';
import BaseError from './BaseError';

export class MisconfiguredError extends BaseError {

	constructor(settingName: string){
		super(`${settingName} are misconfigured`);

		this.name = 'MisconfiguredError';
		this.statusCode = HTTP_RESPONSE.InternalServerError;
		Object.setPrototypeOf(this, MisconfiguredError.prototype);
	}
}

export class MisconfiguredSchemaError extends BaseError{

	constructor(schema: string){
		super(`${schema}: Schema not founded`);

		this.name = 'MisconfiguredSchemaError';
		this.statusCode = HTTP_RESPONSE.InternalServerError;
		Object.setPrototypeOf(this, MisconfiguredSchemaError.prototype);
	}
}

export class NotImplementedError extends BaseError {

	constructor(){
		super('Not implemented!');

		this.name = 'NotImplementedError';
		this.statusCode = HTTP_RESPONSE.InternalServerError;
		Object.setPrototypeOf(this, NotImplementedError.prototype);
	}
}
