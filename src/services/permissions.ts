import { Resource, Role } from '../types/enums';
import { Actions, Resources } from '../utils/consts';
import { IActionPermission, IRule } from '../types/interfaces';
import createError from 'http-errors';
import { MisconfiguredError } from '../utils/errors/code.errors';

const userSensitiveColumns = [
	'id', 'role', 'password'
] as const;

const petSensitiveColumns = [
	'id', 'shelterId'
] as const;

const shelterSensitiveColumns = [
	'id', 'userId'
] as const;

const tutorSensitiveColumns = [
	'id', 'userId'
] as const;

const autoColumns = [
	'create_date', 'update_date', 'delete_date'
] as const;

const getAutoColumns = (alias: string) => {
	return autoColumns.map( col => `${alias}.${col}`);
};

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

const getTutorSensitiveColumns = (alias?: string) => {
	if(alias === undefined)
		return tutorSensitiveColumns;
	else
		return tutorSensitiveColumns.map( col => `${alias}.${col}`);
};

const petPermission: IRule = {
	resource: Resources.PET,
	permissions: [
		{
			action: Actions.ALL,
			roles: [Role.ADMIN],
			ownership: false,
			attributes: {
				included: ['*', 'shelter.*', 'user.*']
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
				excluded: ['adopted', ...getPetSensitiveColumns(), ...autoColumns]
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
				excluded: []
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
				excluded: [...getTutorSensitiveColumns(), ...getUserSensitiveColumns('user')]
			}
		},
		{
			action: Actions.UPDATE,
			roles: [Role.TUTOR],
			ownership: true,
			attributes: {
				excluded: [...getTutorSensitiveColumns(), ...getUserSensitiveColumns('user')]
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
				excluded: [...getShelterSensitiveColumns(), ...getPetSensitiveColumns('pets'), ...getUserSensitiveColumns('user'), ...autoColumns, ...getAutoColumns('pets'), ...getAutoColumns('user')]
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
			ownership: false,
			attributes: {
				excluded: []
			}
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
				excluded: [ ...getUserSensitiveColumns(), ...autoColumns]
			}
		}
	]
};

const adoptionPermission: IRule = {
	resource: Resources.ADOPTION,
	permissions: [
		{
			action: Actions.READ,
			roles: [Role.ADMIN],
			ownership: false,
			attributes: {
				excluded: []
			}
		},
		{
			action: Actions.READ,
			roles: [Role.SHELTER],
			ownership: true,
			attributes: {
				excluded: []
			}
		},
		{
			action: Actions.DELETE,
			roles: [Role.SHELTER],
			ownership: true,
			attributes: {
				excluded: []
			}
		},
		{
			action: Actions.CREATE,
			roles: [Role.SHELTER],
			ownership: true,
			attributes: {
				excluded: []
			}
		}
	]
};

export const permissions = {pet: petPermission, tutor: tutorPermission, shelter: shelterPermission, user: userPermission, adoption: adoptionPermission};

export const getPermission = (resource: Resource) => {
	switch (resource){
	case 'pet':
		return petPermission.permissions;
	case 'shelter':
		return shelterPermission.permissions;
	case 'tutor':
		return tutorPermission.permissions;
	case 'user':
		return userPermission.permissions;
	case 'adoption':
		return adoptionPermission.permissions;
	default:
		throw new MisconfiguredError('Permission rules');
	}
};

export const checkGrant = (permission: IActionPermission, role?: Role) => {
	let hasRequiredRole = false;

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

export const isPropertiesPermissionMisconfigured = ({excluded, included}: any) => {
	if(excluded === undefined && included === undefined) 
		return true;

	if(excluded !== undefined && included !== undefined)
		return true;

	return false;
};