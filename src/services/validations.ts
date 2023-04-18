import createError from 'http-errors';

export const phoneRegex = '^\\s*(\\d{2}|\\d{0})[-. ]?(\\d{5}|\\d{4})[-. ]?(\\d{4})[-. ]?\\s*$';

export const stateRegex = '^[A-Z]{2}$';

export const idReplacememtIsNotAllowed = (bodyId: string | undefined, paramId: string) => {
	if(bodyId !== undefined && bodyId !== paramId)
		throw createError.BadRequest('id replacememt is not allowed');
};