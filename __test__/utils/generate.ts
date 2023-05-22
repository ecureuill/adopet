import { randomUUID } from 'crypto';
import { IPet, IShelter, ITutor, IUser } from '../../src/types/schemas';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { AgeUnit, PetType, Role, SizeVariety } from '../../src/types/enums';
import { EnumType } from 'typescript';
import { createJwtToken } from '../../src/services/tokens';

export const getRandomEnum = <TEnum> (anEnum: TEnum) => {
	const enumValues = Object.keys(anEnum as EnumType);
	const randomIndex = Math.floor(Math.random() * enumValues.length / 2);
	return anEnum[enumValues[randomIndex] as keyof TEnum];
};

export const generateToken = (override: {id?: string, role?: Role} = {}) => {
	return createJwtToken({
		id: randomUUID(),
		role: getRandomEnum(Role.ADMIN) as Role,
		...override
	});
};

export const generateUserData = (overide = {}, includeSensitive = true): IUser => {
	if(includeSensitive)
		return {
			id: randomUUID(),
			name: faker.name.fullName(),
			email: faker.internet.email(),
			password: faker.internet.password(),
			city: faker.address.city(),
			state: faker.address.stateAbbr(),
			phone: faker.phone.number('## #####-####'),
			role: getRandomEnum(Role),
			...overide,
		};
	return {
		name: faker.name.fullName(),
		email: faker.internet.email(),
		city: faker.address.city(),
		state: faker.address.stateAbbr(),
		phone: faker.phone.number('## #####-####'),
		...overide,
	} as IUser;
};

export const generateUsersData = (n = 1, overide = {}): IUser[] => {
	return Array.from({length: n},(_, i) => {
		return generateUserData(overide);
	});
};

export const generatePetData = (overide = {}, includeSensitive = true): IPet => {
	console.debug(`generatePetData ${includeSensitive}`)

	if(includeSensitive)
		return {
			id: randomUUID(),
			shelterId: randomUUID(),
			photo: faker.image.animals(),
			adopted: faker.datatype.boolean(),
			age: faker.datatype.number(),
			age_unit: getRandomEnum(AgeUnit),
			size_variety: getRandomEnum(SizeVariety),
			type: getRandomEnum(PetType),
			name: faker.name.firstName(),
			...overide,
		};
	return {
		photo: faker.image.animals(),
		adopted: faker.datatype.boolean(),
		age: faker.datatype.number(),
		age_unit: getRandomEnum(AgeUnit),
		size_variety: getRandomEnum(SizeVariety),
		type: getRandomEnum(PetType),
		name: faker.name.firstName(),
		...overide,
	} as IPet;

};

export const generatePetsData = (n = 1, overide = {}, includeSensitive = true): IPet[] => {
	return Array.from({length: n},(_, i) => {
		return generatePetData(overide, includeSensitive);
	});
};

export const generateTutorData = (overide: {
	tutor?: Partial<ITutor>,
	user?: Partial<IUser>,
} = {tutor: {}, user: {}}): ITutor => {
	const user = generateUserData({role: 'tutor', ...overide.user});

	return {
		user: user,
		id: randomUUID(),
		userId: user.id,
		about: faker.lorem.paragraph(),
		photo: faker.image.people(),
		...overide.tutor,
	};
};

export const generateTutorsData = (n = 1, overide: {
	tutor?: Partial<ITutor>,
	user?: Partial<IUser>,
} = {tutor: {}, user: {}}): ITutor[] => {
	return Array.from({length: n},(_, i) => {
		return generateTutorData(overide);
	});
};

export const generateShelterData = (overide: {
	shelter?: Partial<IShelter>,
	user?: Partial<IUser>,
	pet?: Partial<IPet>,
} = {shelter: {}, user: {}, pet: {}}, includeSensitive = true, petNumber: number = faker.datatype.number({min: 0, max: 5})): IShelter => {

	const user = generateUserData({role: 'shelter', ...overide.user}, includeSensitive);
	const id = randomUUID();
	
	if(includeSensitive)
		return {
			user: user,
			id: id,
			userId: user.id,
			inactive: faker.datatype.boolean(),
			pets: generatePetsData(petNumber, { shelterId: id, ...overide.pet}, includeSensitive),
			...overide.shelter,
		};

	return {
		user: user,
		inactive: faker.datatype.boolean(),
		pets: generatePetsData(petNumber, {},includeSensitive),
		...overide,
	} as IShelter;
};

export const generateSheltersData = (n = 1, overide: {
	shelter?: Partial<IShelter>,
	user?: Partial<IUser>,
	pet?: Partial<IPet>,
} = {shelter: {}, user: {}, pet: {}}): IShelter[] => {
	return Array.from({length: n},(_, i) => {
		return generateShelterData(overide);
	});
};