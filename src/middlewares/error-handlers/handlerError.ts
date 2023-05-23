import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import NotImplementedError from '../../utils/errors/NotImplementedError';
import { HTTP_RESPONSE } from '../../utils/consts';

export const handleError = (error: Error | HttpError | NotImplementedError, request: Request, response: Response, next: NextFunction) => {

	if(error instanceof HttpError)
		return response.status(error.status || HTTP_RESPONSE.InternalServerError).json({
			error_name: error.name,
			error_msg: error.message,
			message: error.message || 'Something went wrong on TypeORM!'
		});

	if(error instanceof NotImplementedError)
		return response.status(error.statusCode).json({
			error_name: error.name,
			error_msg: error.message,
			message: error.message
		});

	return response.status(HTTP_RESPONSE.InternalServerError).json({
		error_name: error.name,
		error_msg: error.message,
		message: error.message || 'Something went wrong!'
	});		
};		
