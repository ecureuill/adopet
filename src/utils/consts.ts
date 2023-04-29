export const Actions = {
	CREATE: 'create',
	READ: 'read',
	UPDATE: 'update',
	DELETE: 'delete',
	ALL: 'crud',
} as const;

export const Resources = {
	PET: 'pet',
	SHELTER: 'shelter',
	TUTOR: 'tutor',
	USER: 'user',
} as const;

export const USER_NOT_AUTHENTICATED = {
	id: '',
	authenticated: false,
	role: 'ANY',
	permission: {
		granted: false,
		excluded: undefined,
		included: undefined
	} as const
} as const;