import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
import { verifyJwtToken } from '../services/tokens';

export const JWTVerify = (request: Request, response: Response, next: NextFunction) => {

	const token = request.headers.authorization;

	if (token === undefined)
		throw createError.Unauthorized('No token provided.');
	
	const { id, role } = verifyJwtToken(token);
	response.locals.id = id;
	response.locals.role = role;

	next();
};