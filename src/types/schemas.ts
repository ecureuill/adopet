import { Role } from './enums';

export interface IUser {
	id: string;
	role: Role
	email: string;
	password: string;
	name: string;
	phone?: string;
	city?: string;
	state?: string;
}

export interface IPet {
	id: string;
	name: string;
	age: number;
	age_unit: 'y'| 'd' | 'm' ;
	size_variety: 'xxs'| 'xs'| 's'| 'm'| 'l'| 'xl';
	type: 'dog' | 'cat';
	adopted: boolean;
	photo?: string | Buffer;
	shelterId: string;
}

export interface ITutor {
	id: string;
	photo?: string | Buffer,
	about?: string,
	user: IUser
}

export interface IShelter {
	id: string,
	userId: string,
	inactive: boolean,
	pets: Array<IPet>,
	user: IUser
}