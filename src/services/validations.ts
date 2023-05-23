import createError from 'http-errors';
import { IUserSettings } from '../types/interfaces';
import { checkAllIncluded, isPropertiesPermissionMisconfigured } from './permissions';
import { Shelter } from '../entities/Shelter';
import { Pet } from '../entities/Pet';
import { IdReplacementError, NotOwnerError } from '../utils/errors/business.errors';
import { BadRequestError, MethodNotAllowedError, PatchPropertyAllowedError } from '../utils/errors/http.errors';
import { MisconfiguredError } from '../utils/errors/code.errors';

export const phoneRegex = '^\\s*(\\d{2}|\\d{0})[-. ]?(\\d{5}|\\d{4})[-. ]?(\\d{4})[-. ]?\\s*$';

export const stateRegex = '^[A-Z]{2}$';

export const idReplacememtIsNotAllowed = (bodyId: string | undefined, paramId: string) => {
	if(bodyId !== undefined && bodyId !== paramId)
		throw new IdReplacementError();
};

export const isOwnerOrFail = (ownerId: string, id: string) => {
	if(ownerId !== id)
		throw new NotOwnerError();

	return true;
};

export const isPutAllowedOrFail = ({ permission }: IUserSettings, relations: number) => {
	
	if(isPropertiesPermissionMisconfigured(permission))
		throw new MisconfiguredError('Permissions');

	if(permission.excluded !== undefined){
		if(permission.excluded.length === 0)
			return true;

		throw new MethodNotAllowedError('PUT');
	}

	if(permission.included !== undefined){
		if(permission.included.length === 0)
			throw new MethodNotAllowedError('PUT');

		if(permission.included.length < relations + 1)
			throw new MethodNotAllowedError('PUT');

		if(!checkAllIncluded(permission.included))
			throw new MethodNotAllowedError('PUT');
	}
	return true;
};

export const isPropertyUpdateAllowedOrFail = (body: object,  { permission }: IUserSettings, relations: number) => {

	if(isPropertiesPermissionMisconfigured(permission))
		throw new MisconfiguredError('Permissions');

	const payload: string[] = flatPayloadKeys(body);

	if(permission.excluded !== undefined){
		if(permission.excluded.length === 0)
			return true;

		const key = payload.find( key => permission.excluded?.includes(key));
		

		if(key !== undefined)
			throw new PatchPropertyAllowedError(key);

		return true;
	}

	if(permission.included !== undefined){

		if(permission.included.length === 0)
			throw new PatchPropertyAllowedError();
		
		if(checkAllIncluded(permission.included) 
			&& permission.included.length === relations + 1)
			return true;

		const key = payload.find( key => !permission.included?.includes(key));

		if(key !== undefined)
			throw new PatchPropertyAllowedError(key);
	}

	return true;
};


export const checkPetOwner = async (pet: Pet, userId: string) => {
	const shelter = await Shelter.findOneBy({id: pet.shelterId});

	if(shelter === null)
		throw new BadRequestError('Shelter does not exist');
		
	return isOwnerOrFail(shelter.userId, userId);
};

const flatPayloadKeys = (obj: any) : string[] => {
	return Object.keys(obj).reduce((prev: string[], curr: string) => {
		if(typeof obj[curr as keyof object] === 'object' && obj[curr as keyof object] !== null){
			if(Array.isArray(obj[curr as keyof object]))
			{
				let arrayObj = (obj[curr as keyof object] as []).reduce( (prev: string[], curr: string) => flatPayloadKeys(curr), []);

				if(arrayObj.length > 1)
					arrayObj = arrayObj.filter( k => k !== 'id'); //ignore id, because oit is necessary to patch the correct item of array
				return [...prev, ...arrayObj.map(k => `${curr}.${k}`)];
			}
			else
				return [...prev, ...Object.keys(obj[curr as keyof object]).map(k => `${curr}.${k}`)];
		}
		else
			prev.push(curr);
		return prev;
	}, []);
};