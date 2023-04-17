export interface IUser {
	id: string;
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
	photo?: string;
	shelterId: string;
}

export interface ITutor extends IUser {
	photo?: string,
	about?: string
}

export interface IShelter extends IUser {
	pets: Array<IPet>
}