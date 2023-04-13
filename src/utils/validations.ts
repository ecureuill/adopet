import { validate as isValidUUID } from 'uuid';
import createError from 'http-errors';
import { Variant } from '.';

export const checkRequiredField = (obj: Variant, key: string) => {
	if( obj[key] === undefined || obj[key].length === 0)
		throw createError.BadRequest(`${key} is required`);
};

export const hasRequiredFields = (obj: object, keys: string[]) => {
	keys.forEach(key => checkRequiredField(obj as Variant, key));
};

export const hasBody = (body: object | undefined) => {
	if(body === undefined)
		throw createError.BadRequest('body is required');
};

export const hasValidID = (id: string | undefined) => {
	if(id === undefined)
		throw createError.BadRequest('id is required');

	if(!isValidUUID(id))
		throw createError.BadRequest(`${id} is not a valid id`);
};

export const idReplacememtIsNotAllowed = (bodyId: string | undefined, paramId: string) => {
	if(bodyId !== undefined && bodyId !== paramId)
		throw createError.BadRequest('id replacememt is not allowed');
};

export const hasValidValue = (obj: Variant, key: string) => {
	if(obj[key]?.length === 0)
		throw createError.BadRequest(`${key} can not be empty value`);	
};