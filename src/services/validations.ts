import createError from 'http-errors';
import { IUserSettings } from '../types/interfaces';
import { checkAllIncluded } from './permissions';

export const phoneRegex = '^\\s*(\\d{2}|\\d{0})[-. ]?(\\d{5}|\\d{4})[-. ]?(\\d{4})[-. ]?\\s*$';

export const stateRegex = '^[A-Z]{2}$';

export const idReplacememtIsNotAllowed = (bodyId: string | undefined, paramId: string) => {
	if(bodyId !== undefined && bodyId !== paramId)
		throw createError.BadRequest('id replacememt is not allowed');
};

export const isOwnerOrFail = (ownerId: string, id: string) => {
	console.debug('isOwnerOrFail');

	if(ownerId !== id)
		throw createError.Forbidden('Only owner is authorized to perform this action');

	return true;
};

export const isPutAllowedOrFail = ({ permission }: IUserSettings) => {
	if(permission.excluded !== undefined || (
		permission.included !== undefined && !checkAllIncluded(permission.included)))
		throw new createError.Forbidden('PUT is not authorized');

	return true;
};

export const isPropertyUpdateAllowedOrFail = (body: object,  { permission }: IUserSettings) => {

	console.debug('isPropertyUpdateAllowedOrFail');
	console.debug(permission);
	console.debug(Object.keys(body));

	if(permission.excluded !== undefined){
		const key = Object.keys(body).find( key => permission.excluded?.includes(key));

		if(key !== undefined)
			throw new createError.Forbidden(`${key} update is not authorized`);

		return true;
	}

	if(permission.included !== undefined){
		if(checkAllIncluded(permission.included))
			return true;

		const key = Object.keys(body).find( key => !permission.included?.includes(key));

		if(key !== undefined)
			throw new createError.Forbidden(`${key} update is not authorized`);

		return true;
	}

	return true;
};