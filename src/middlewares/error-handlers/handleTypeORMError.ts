import { NextFunction, Request, Response } from 'express';
import { EntityNotFoundError, TypeORMError } from 'typeorm';
import { HTTP_RESPONSE } from '../../utils/consts';
import Flatted from 'flatted';


export const handleTypeORMError = (error: TypeORMError, request: Request, response: Response, next: NextFunction) => {

	if (error instanceof EntityNotFoundError)
		return response.status(HTTP_RESPONSE.BadRequest).json(Flatted.parse(Flatted.stringify({
			error_name: error.name,
			error_msg: error.message,
			message: 'Resource do not exist'

		})));

	if(error instanceof TypeORMError)
		return response.status(HTTP_RESPONSE.InternalServerError).json(Flatted.parse(Flatted.stringify({
			error_name: `TypeORMErrorGENERIC ${error.name}`,
			error_msg: error.message,
			message: error.message

		})));
	
	next(error);
};