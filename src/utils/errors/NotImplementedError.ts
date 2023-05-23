import { HTTP_RESPONSE } from '../consts';

export default class NotImplementedError extends Error {

	statusCode: number;

	constructor(){
		super('Not implemented!');

		this.name = 'NotImplementedError';
		this.statusCode = HTTP_RESPONSE.InternalServerError;
		Error.captureStackTrace(this);
	}
}