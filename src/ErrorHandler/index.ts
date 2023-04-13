import { NextFunction, Request, Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { HttpError } from 'http-errors';

export const asyncHandler = (fn: {(request: Request, response: Response, next: NextFunction): Promise<any> }) => (request: Request, response: Response, next: NextFunction) => {
	return Promise
		.resolve(fn(request, response, next))
		.catch(next);
};

export const HandleTypeORMError = (error: HttpError, request: Request, response: Response, next: NextFunction) => {

	if (error instanceof EntityNotFoundError)
		return response.status(404).json({
			error_name: error.name,
			error_msg: error.message,
			message: 'Não encontrado'

		});

	if(error instanceof QueryFailedError)
		return response.status(400).json({
			error_name: error.name,
			error_msg: error.message,
			message: error.message

		});

	next(error);
};

export const HandleError = (error: HttpError, request: Request, response: Response, next: NextFunction) => {

	return response.status(error.status || 500).json({
		error_name: error.name,
		error_msg: error.message,
		message: error.message || 'Something went wrong!'
	});
};