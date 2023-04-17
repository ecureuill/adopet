import { NextFunction, Request, Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { HttpError } from 'http-errors';


export const handleTypeORMError = (error: HttpError, request: Request, response: Response, next: NextFunction) => {

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