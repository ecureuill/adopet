import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import { HTTP_RESPONSE } from '../../utils/consts';
import BaseError from '../../utils/errors/BaseError';
import Flatted from 'flatted';

export const handleError = (error: Error | HttpError, request: Request, response: Response, next: NextFunction) => {

	if(error instanceof HttpError)
		return response.status(error.statusCode || HTTP_RESPONSE.InternalServerError).json(Flatted.parse(Flatted.stringify({
			error_name: error.name,
			error_msg: error.message,
			error_headers: error.headers,
			message: error.message || 'Something went wrong on TypeORM!'
		})));

	if(error instanceof BaseError)
		return response.status(error.statusCode).json(Flatted.parse(Flatted.stringify({
			error_name: error.name,
			error_msg: error.message,
			message: error.message
		})));

	return response.status(HTTP_RESPONSE.InternalServerError).json(Flatted.parse(Flatted.stringify({
		error_name: error.name,
		error_msg: error.message,
		message: error.message || 'Something went wrong!'
	})));		
};		
