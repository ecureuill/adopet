import { NextFunction, Request, Response } from 'express';
import { verifyJwtToken } from '../services/tokens';
import { IUserSettings } from '../types/interfaces';
import { USER_NOT_AUTHENTICATED } from '../utils/consts';

export const JWTVerify = (request: Request, response: Response, next: NextFunction) => {

	const token = request.headers.authorization;
	
	if (token === undefined)
		response.locals.user = USER_NOT_AUTHENTICATED as unknown as IUserSettings;
	else 
	{
		const { id, role } = verifyJwtToken(token);

		response.locals.user = {
			id: id,
			authenticated: true,
			role: role
		} as IUserSettings;
	}
	next();
};