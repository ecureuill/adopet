import { HTTP_RESPONSE } from '../consts';
import BaseError from './BaseError';

export class IdReplacementError extends BaseError {

	constructor(){
		super('id replacememt is not allowed');

		this.name = 'IdReplacementError';
		this.statusCode = HTTP_RESPONSE.BadRequest;
		Object.setPrototypeOf(this, IdReplacementError.prototype);
	}
}

export class NotOwnerError extends BaseError{
	
	constructor(){
		super('Only owner is authorized to perform this action');

		this.name = 'NotOwnerError';
		this.statusCode = HTTP_RESPONSE.Forbidden;
		Object.setPrototypeOf(this, NotOwnerError.prototype);
	}
}

export class SignUPEmailError extends BaseError{
	
	constructor(){
		super('Email already exist');

		this.name = 'SignUPEmailError';
		this.statusCode = HTTP_RESPONSE.BadRequest;
		Object.setPrototypeOf(this, SignUPEmailError.prototype);
	}
	
}

export class SignInLoginError extends BaseError{
	
	constructor(){
		super('Invalid credentials');

		this.name = 'SignInLoginError';
		this.statusCode = HTTP_RESPONSE.Unauthorized;
		Object.setPrototypeOf(this, SignInLoginError.prototype);
	}
	
}

export class AdoptionError extends BaseError{
	
	constructor(){
		super('Pet already adopted');

		this.name = 'AdoptionError';
		this.statusCode = HTTP_RESPONSE.BadRequest;
		Object.setPrototypeOf(this, AdoptionError.prototype);
	}
	
}