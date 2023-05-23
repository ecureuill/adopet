import { HTTP_RESPONSE } from '../consts';

export default class BaseError extends Error {

	statusCode: number;

	constructor(message: string){
		super(message);
		this.statusCode = HTTP_RESPONSE.InternalServerError;
		this.name = 'BaseError';
		Error.captureStackTrace(this);
		Object.setPrototypeOf(this, BaseError.prototype);
	}
}