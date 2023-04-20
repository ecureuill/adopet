import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
import { Role } from '../types/enums';

export const validateAuthorization = (roles: Role[]) =>  (request: Request, response: Response, next: NextFunction) => {

	console.debug(response.locals);
	console.debug(roles);
	const validation = roles.includes(response.locals.role);
	console.debug(validation);

	if(!validation){
		throw new createError.Forbidden();
	}
	
	return next();
};