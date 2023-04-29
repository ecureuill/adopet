import { Resource, Role } from '../types/enums';
import { Actions, Resources } from '../utils/consts';
import { IActionPermission, IRule } from '../types/interfaces';
import createError from 'http-errors';

const userSensitiveColumns = [
	'id', 'role', 'password'
] as const;

const petSensitiveColumns = [
	'id', 'shelterId'
] as const;

const shelterSensitiveColumns = [
	'id', 'userId'
] as const;

const getUserSensitiveColumns = (alias?: string) => {
	if(alias === undefined)
		return userSensitiveColumns;
	else
		return userSensitiveColumns.map( col => `${alias}.${col}`);
};

const getPetSensitiveColumns = (alias?: string) => {
	if(alias === undefined)
		return petSensitiveColumns;
	else
		return petSensitiveColumns.map( col => `${alias}.${col}`);
};

const getShelterSensitiveColumns = (alias?: string) => {
	if(alias === undefined)
		return shelterSensitiveColumns;
	else
		return shelterSensitiveColumns.map( col => `${alias}.${col}`);
};

const petPermission: IRule = {
	resource: Resources.PET,
	permissions: [
		{
			action: Actions.ALL,
			roles: [Role.ADMIN],
			ownership: false,
			attributes: {
				included: ['*', 'user.*', 'pets.*']
			}
		},
		{
			action: Actions.CREATE,
			roles: [Role.SHELTER],
			ownership: true
		},
		{
			action: Actions.READ,
			roles: 'NONE',
			ownership: false,
			attributes: {
				excluded: [...getPetSensitiveColumns()]
			}
		},
		{
			action: Actions.UPDATE,
			roles: [Role.SHELTER],
			ownership: true,
			attributes: {
				excluded: ['adopted', ...getPetSensitiveColumns()]
			}
		},
		{
			action: Actions.DELETE,
			roles: [Role.SHELTER],
			ownership: true
		}
	]
};

const tutorPermission: IRule = {
	resource: Resources.TUTOR,
	permissions: [
		{
			action: Actions.ALL,
			roles: [Role.ADMIN],
			ownership: false,
			attributes: {
				included: ['*', 'user.*', 'pets.*']
			}
		},
		{
			action: Actions.CREATE,
			roles: 'NONE',
			ownership: false
		},
		{
			action: Actions.READ,
			roles: [Role.TUTOR],
			ownership: true,
			attributes: {
				included: ['*', 'user.*', 'pets.*']// excluded: [...getShelterSensitiveColumns(), ...getUserSensitiveColumns('user')]
			}
		},
		{
			action: Actions.UPDATE,
			roles: [Role.TUTOR],
			ownership: true,
			attributes: {
				excluded: [...getShelterSensitiveColumns(), ...getUserSensitiveColumns('user')]
			}
		}
	]
};

const shelterPermission: IRule = {
	resource: Resources.SHELTER,
	permissions: [
		{
			action: Actions.ALL,
			roles: [Role.ADMIN],
			ownership: false,
			attributes: {
				included: ['*', 'user.*', 'pets.*']
			}
		},
		{
			action: Actions.CREATE,
			roles: 'NONE',
			ownership: false
		},
		{
			action: Actions.READ,
			roles: 'NONE',
			ownership: false,
			attributes: {
				excluded: [...getShelterSensitiveColumns(), ...getPetSensitiveColumns('pets'), ...getUserSensitiveColumns('user')]
			}
		},
		{
			action: Actions.UPDATE,
			roles: [Role.SHELTER],
			ownership: true,
			attributes: {
				excluded: [...getShelterSensitiveColumns(), ...getPetSensitiveColumns('pets'), ...getUserSensitiveColumns('user')]
			}
		},
		{
			action: Actions.DELETE,
			roles: [Role.SHELTER],
			ownership: true
		}
	]
};

const userPermission: IRule = {
	resource: Resources.USER,
	permissions: [
		{
			action: Actions.ALL,
			roles: [Role.ADMIN],
			ownership: false
		},
		{
			action: Actions.READ,
			roles: [Role.SHELTER, Role.TUTOR],
			ownership: true,
			attributes: {
				excluded: [ ...getUserSensitiveColumns()]
			}
		},
		{
			action: Actions.UPDATE,
			roles: [Role.SHELTER, Role.TUTOR],
			ownership: true,
			attributes: {
				excluded: [ ...getUserSensitiveColumns()]
			}
		}
	]
};

export const permissions = [petPermission, tutorPermission, shelterPermission, userPermission];

export const getPermission = (resource: Resource) => {
	console.debug(`getPermission for ${resource}`);

	switch (resource){
	case 'pet':
		return petPermission.permissions;
	case 'shelter':
		return shelterPermission.permissions;
	case 'tutor':
		return tutorPermission.permissions;
	case 'user':
		return userPermission.permissions;
	default:
		throw new createError.InternalServerError(`No permission rules for ${resource}`);
	}
};

export const checkGrant = (permission: IActionPermission, role?: Role) => {
	let hasRequiredRole = false;

	console.debug(`Check roles ${permission.roles}`);
	console.debug(`User role ${role}`);
	if(typeof(permission.roles) !== 'string' && role !== undefined)
	{
		hasRequiredRole = permission.roles.some((r: Role) => r === role);
	}
	else{
		hasRequiredRole = permission.roles === 'NONE';
	}

	if(hasRequiredRole)
	{
		return {
			granted: true,
			ownershipRequired: permission.ownership,
			...permission.attributes
		};
	}

	return { granted: false};
};

export const checkAllIncluded = (included: string[]) => {
	return included.every(p => /\*/.test(p));
};