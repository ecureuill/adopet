import { JwtPayload } from 'jsonwebtoken';
import { Action, Resource, Role } from './enums';
import { ObjectLiteral } from 'typeorm';

export interface UserJwtPayload extends JwtPayload {
	id: string,
	role: string
}

export interface IRule {
	resource: Resource,
	permissions: IActionPermission[],
}

export interface IAttributesRule {
	excluded?: string[],
	included?: string[],
}

export interface IActionPermission {
	action: Action
	roles: Role[] | 'NONE',
	ownership: boolean
	attributes?: IAttributesRule
}

export interface IUserSettings {
	id: string,
	authenticated: boolean
	role: string,
	permission: {
		granted: boolean,
		ownershipRequired?: boolean,
		excluded?: string[],
		included?: string[]
	}
}

export interface IJoin {
	property: string,
	alias: string,
	condition? : string,
	parametes? : ObjectLiteral
}