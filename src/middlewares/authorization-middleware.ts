import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
import { Action, Resource } from '../types/enums';
import { checkGrant, getPermission } from '../services/permissions';
import { Actions } from '../utils/consts';
import { IUserSettings } from '../types/interfaces';
import { ForbiddenError } from '../utils/errors/http.errors';

const validatePermissions = (resource: Resource, action: Action) => (request: Request, response: Response, next: NextFunction)  => {
	
	const userRole = response.locals?.user?.role;
	const permissions = getPermission(resource);

	const grantALL = permissions.find(p => p.action === Actions.ALL);
	
	if(grantALL !== undefined){	
		let result;

		if(response.locals.user.authenticated)
			result = checkGrant(grantALL, userRole);
		else
			result = checkGrant(grantALL);

		if(result.granted){
			(response.locals.user as IUserSettings).permission = result;			return next();
		}
	}

	const grantByActions = permissions.filter(p => p.action === action);
		
	const granted = grantByActions.some( permission => {
		const result = checkGrant(permission, userRole);

		if(result.granted){
			(response.locals.user as IUserSettings).permission = result;
			return true;
		}
	});
	
	if(granted)
		return next();

	if(response.locals.user.authenticated)
		throw new ForbiddenError();
	throw new createError.Unauthorized('Missing token');
};

export default validatePermissions;