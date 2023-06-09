import { NextFunction, Request, Response } from 'express';
import { HTTP_RESPONSE } from '../../utils/consts';
import JSONSchemaValidatorError from '../../utils/errors/JSONSchemaValidatorError';
import Flatted from 'flatted';

export const handleSchemaError = (error: JSONSchemaValidatorError, request: Request, response: Response, next: NextFunction) => {

	if (error instanceof JSONSchemaValidatorError){
		return response.status(HTTP_RESPONSE.BadRequest).json(Flatted.parse(Flatted.stringify({
			error_name: error.name,
			error_msg: error.ajvError.message,
			params: error.ajvError.params,
			message: `${error.ajvError.instancePath} ${error.ajvError.message}`
		})));
	}

	next(error);
};
