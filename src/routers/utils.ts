import { validate as isValidUUID } from 'uuid';

export const isValidID = (id: string | undefined) => {
	if(id === undefined)
		return {validUUID: false, invalidUUIDMessage: 'required id'};

	if(!isValidUUID(id))
		return {validUUID: false, invalidUUIDMessage: 'required a valid UUID id'};

	return {validUUID: true, invalidUUIDMessage: ''};
};

export const isValidBody = (body: object | undefined) => {
	if(body === undefined)
		return {validBody: false, invalidBodyMessage: 'body is required'};
	
	return {validBody: true, invalidBodyMessage: ''};
};

export const hasRequiredValues = (name: any, password: any, email: any) => {

	if( name === undefined || name.length === 0)
		return {validValue: false, invalidValueMessage: 'name is required'};

	if( email === undefined || email.length === 0)
		return {validValue: false, invalidValueMessage: 'email is required'};

	if( password === undefined || password.length === 0)
		return {validValue: false, invalidValueMessage: 'password is required'};

	return {validValue: true, invalidValueMessage: ''};
};