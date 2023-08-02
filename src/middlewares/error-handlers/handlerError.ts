import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import { HTTP_RESPONSE } from '../../utils/consts';
import BaseError from '../../utils/errors/BaseError';
import Flatted from 'flatted';
import JSONSchemaValidatorError from '../../utils/errors/JSONSchemaValidatorError';

export const handleError = (error: Error | HttpError, request: Request, response: Response, next: NextFunction) => {

	if(error instanceof HttpError)
		return response.status(error.statusCode || HTTP_RESPONSE.InternalServerError).json(Flatted.parse(Flatted.stringify({
			name: error.name,
			message: error.message || 'Something went wrong on TypeORM!'
		})));

	if(error instanceof BaseError || error instanceof JSONSchemaValidatorError){
		const { statusCode } = error;
		
		return response.status(statusCode).json(Flatted.parse(Flatted.stringify({
			...error
		})));
	}
		
	return response.status(HTTP_RESPONSE.InternalServerError).json(Flatted.parse(Flatted.stringify({
		name: error.name,
		message: error.message || 'Something went wrong!'
	})));		
};		
