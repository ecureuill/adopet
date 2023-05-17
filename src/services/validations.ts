import createError from 'http-errors';
import { IUserSettings } from '../types/interfaces';
import { checkAllIncluded, isPropertiesPermissionMisconfigured } from './permissions';
import createHttpError from 'http-errors';
import { Shelter } from '../entities/Shelter';
import { Pet } from '../entities/Pet';

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

export const isPutAllowedOrFail = ({ permission }: IUserSettings, relations: number) => {
	
	if(isPropertiesPermissionMisconfigured(permission))
		throw new createError.InternalServerError('Permissions are misconfigured');

	if(permission.excluded !== undefined){
		if(permission.excluded.length === 0)
			return true;

		throw new createError.Forbidden('PUT is not authorized');
	}

	if(permission.included !== undefined){
		if(permission.included.length === 0)
			throw new createError.Forbidden('PUT is not authorized');

		if(permission.included.length < relations + 1)
			throw new createError.Forbidden('PUT is not authorized');

		if(!checkAllIncluded(permission.included))
			throw new createError.Forbidden('PUT is not authorized');
	}
	return true;
};

export const isPropertyUpdateAllowedOrFail = (body: object,  { permission }: IUserSettings, relations: number) => {
	console.debug(body);

	if(isPropertiesPermissionMisconfigured(permission))
		throw new createError.InternalServerError('Permissions are misconfigured');

	if(permission.excluded !== undefined){
		if(permission.excluded.length === 0)
			return true;

		const key = Object.keys(body).find( key => permission.excluded?.includes(key));

		if(key !== undefined)
			throw new createError.Forbidden(`${key} update is not authorized`);

		return true;
	}

	if(permission.included !== undefined){
		console.debug(permission.included);

		if(permission.included.length === 0)
			throw new createError.Forbidden('Property update is not authorized');
		
		if(checkAllIncluded(permission.included) 
			&& permission.included.length === relations + 1)
			return true;

		const properties: string[] = Object.keys(body).reduce((prev: string[], curr: string) => {

			if(typeof(body[curr as keyof object]) === 'object'){
				return [...prev, ...Object.keys(body[curr as keyof object]).map(k => `${curr}.${k}`)];
			}
			else
				prev.push(curr);
			return prev;
		}, []);
		console.debug('properties');
		console.debug(properties);

		const key = Object.keys(properties).find( key => !permission.included?.includes(key));

		if(key !== undefined)
			throw new createError.Forbidden(`${key} update is not authorized`);
	}

	return true;
};


export const checkPetOwner = async (pet: Pet, userId: string) => {
	console.debug('checkPetOwner');
	const shelter = await Shelter.findOneBy({id: pet.shelterId});

	if(shelter === null)
		throw new createHttpError.BadRequest('Shelter does not exist');
		
	return isOwnerOrFail(shelter.userId, userId);
};