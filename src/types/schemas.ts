import { Role } from './enums';

export interface IUser {
	id: `${string}-${string}-${string}-${string}-${string}` | string;
	role: Role
	email: string;
	password: string;
	name: string;
	phone?: string;
	city?: string;
	state?: string;
	delete_date?: string;
}

export interface IPet {
	id: `${string}-${string}-${string}-${string}-${string}` | string;
	name: string;
	age: number;
	age_unit: 'y'| 'd' | 'm' ;
	size_variety: 'xxs'| 'xs'| 's'| 'm'| 'l'| 'xl';
	type: 'dog' | 'cat';
	adopted: boolean;
	photo?: string | Buffer;
	shelterId: `${string}-${string}-${string}-${string}-${string}` | string;
	delete_date?: string;
	create_date?: string;
	update_date?: string;
}

export interface ITutor {
	id: `${string}-${string}-${string}-${string}-${string}` | string;
	userId: `${string}-${string}-${string}-${string}-${string}` | string,
	photo?: string | Buffer,
	about?: string,
	user: IUser
	delete_date?: string;
}

export interface IShelter {
	id: `${string}-${string}-${string}-${string}-${string}` | string,
	userId: `${string}-${string}-${string}-${string}-${string}` | string,
	inactive: boolean,
	pets: Array<IPet>,
	user: IUser
	delete_date?: string;
}