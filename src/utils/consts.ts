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
	ADOPTION: 'adoption',
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

export const HTTP_RESPONSE = {
	OK: 200,
	Created: 201,
	BadRequest: 400,
	Unauthorized: 401,
	Forbidden: 403,
	NotFound: 404,
	MethodNotAllowed: 405,
	InternalServerError: 500,
	NotImplemented: 501,
} as const;