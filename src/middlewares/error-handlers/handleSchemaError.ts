import { NextFunction, Request, Response } from 'express';
import { JSONSchemaValidatorError } from '../../utils/JSONSchemaValidatorError';
import { HTTP_RESPONSE } from '../../utils/consts';

export const handleSchemaError = (error: JSONSchemaValidatorError, request: Request, response: Response, next: NextFunction) => {

	if (error instanceof JSONSchemaValidatorError){

		return response.status(HTTP_RESPONSE.BadRequest).json({
			error_name: error.name,
			error_msg: error.ajvError.message,
			params: error.ajvError.params,
			message: `${error.ajvError.instancePath} ${error.ajvError.message}`
		});
	}

	next(error);
};
