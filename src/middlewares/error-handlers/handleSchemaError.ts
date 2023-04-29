import { NextFunction, Request, Response } from 'express';
import { JSONSchemaValidatorError } from '../../utils/JSONSchemaValidatorError';

export const handleSchemaError = (error: JSONSchemaValidatorError, request: Request, response: Response, next: NextFunction) => {

	if (error instanceof JSONSchemaValidatorError){

		return response.status(404).json({
			error_name: error.name,
			error_msg: error.ajvError.message,
			params: error.ajvError.params
		});
	}

	next(error);
};
