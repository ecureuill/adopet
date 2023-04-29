import { Actions, Resources } from '../utils/consts';

export enum PetType {
	DOG = 'dog',
	CAT = 'cat'
}

export enum SizeVariety {
	XXSMALL = 'xxs',
	XSMALL = 'xs',
	SMALL = 's',
	MEDIUM = 'm',
	LARGE = 'l',
	XLARGE = 'xl'
}

export enum AgeUnit {
	DAYS = 'd',
	MONTHS = 'm',
	YEARS = 'y'
}

export enum Gender {
	FEMALE = 'f',
	MALE = 'm'
}

export enum Role {
	ADMIN = 'admin',
	TUTOR = 'tutor',
	SHELTER = 'shelter'
}

export type Resource = typeof Resources[keyof typeof Resources];

export type Action = typeof Actions[keyof typeof Actions];