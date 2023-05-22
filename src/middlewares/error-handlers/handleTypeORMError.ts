import { NextFunction, Request, Response } from 'express';
import { EntityNotFoundError, TypeORMError } from 'typeorm';
import { HttpError } from 'http-errors';
import { HTTP_RESPONSE } from '../../utils/consts';


export const handleTypeORMError = (error: HttpError, request: Request, response: Response, next: NextFunction) => {

	if (error instanceof EntityNotFoundError)
		return response.status(HTTP_RESPONSE.BadRequest).json({
			error_name: error.name,
			error_msg: error.message,
			message: 'Resource do not exist'

		});

	if(error instanceof TypeORMError)
		return response.status(501).json({
			error_name: `TypeORMErrorGENERIC ${error.name}`,
			error_msg: error.message,
			message: error.message

		});
	
	next(error);
};