import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
import { Action, Resource } from '../types/enums';
import { checkGrant, getPermission } from '../services/permissions';
import { Actions } from '../utils/consts';
import { IUserSettings } from '../types/interfaces';

export const validatePermissions = (resource: Resource, action: Action) => (request: Request, response: Response, next: NextFunction)  => {
	
	console.debug('validatePermissions MIDDLEWARE');

	const userRole = response.locals?.user?.role;
	const permissions = getPermission(resource);

	const grantALL = permissions.find(p => p.action === Actions.ALL);
	
	if(grantALL !== undefined){	
		let result;

		if(response.locals.user.authenticated){
			result = checkGrant(grantALL, userRole);
		}
		else
		{
			result = checkGrant(grantALL);
		}

		console.debug('grantALL result');
		console.debug(result);

		if(result.granted){
			(response.locals.user as IUserSettings).permission = result;
			console.debug(response.locals);
			console.debug(response.locals.user);
			return next();
		}
	}

	const grantByActions = permissions.filter(p => p.action === action);
		
	const granted = grantByActions.some( permission => {
		const result = checkGrant(permission, userRole);

		console.debug('grantByActions result');
		console.debug(result);

		if(result.granted){
			(response.locals.user as IUserSettings).permission = result;
			console.debug(response.locals);
			console.debug(response.locals.user);

			return true;
		}
	});
	
	if(granted)
		return next();

	throw new createError.Forbidden('This action is not authorized');
};