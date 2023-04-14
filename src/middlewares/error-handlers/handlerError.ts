import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';

export const handleError = (error: HttpError, request: Request, response: Response, next: NextFunction) => {

	return response.status(error.status || 500).json({
		error_name: error.name,
		error_msg: error.message,
		message: error.message || 'Something went wrong!'
	});
};