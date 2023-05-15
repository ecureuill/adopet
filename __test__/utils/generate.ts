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

export const generateUserData = (overide = {}): IUser => {
	return {
		id: randomUUID(),
		name: faker.name.fullName(),
		email: faker.internet.email(),
		password: faker.internet.password(),
		city: faker.address.city(),
		state: faker.address.stateAbbr(),
		phone: faker.phone.number('## #.####-####'),
		role: getRandomEnum(Role),
		...overide,
	};
};

export const generateUsersData = (n = 1, overide = {}): IUser[] => {
	return Array.from({length: n},(_, i) => {
		return generateUserData(overide);
	});
};

export const generatePetData = (overide = {}): IPet => {
	return {
		id: randomUUID(),
		shelterId: randomUUID(),
		photo: faker.image.animals(),
		adopted: faker.datatype.boolean(),
		age: faker.datatype.number({min: 1, max: 20}),
		age_unit: getRandomEnum(AgeUnit),
		size_variety: getRandomEnum(SizeVariety),
		type: getRandomEnum(PetType),
		name: faker.name.firstName(),
		...overide,
	};
};

export const generatePetsData = (n = 1, overide = {}): IPet[] => {
	return Array.from({length: n},(_, i) => {
		return generatePetData(overide);
	});
};

export const generateTutorData = (overide = {}): ITutor => {
	const user = generateUserData();

	return {
		user: user,
		id: randomUUID(),
		userId: user.id,
		about: faker.lorem.paragraph(),
		photo: faker.image.people(),
		...overide,
	};
};

export const generateTutorsData = (n = 1, overide = {}): ITutor[] => {
	return Array.from({length: n},(_, i) => {
		return generateTutorData(overide);
	});
};

export const generateShelterData = (overide = {}): IShelter => {
	const user = generateUserData();
	const id = randomUUID();

	return {
		user: user,
		id: id,
		userId: user.id,
		inactive: faker.datatype.boolean(),
		pets: generatePetsData(faker.datatype.number({min: 0, max: 5}), { shelterId: id}),
		...overide,
	};
};

export const generateSheltersData = (n = 1, overide = {}): IShelter[] => {
	return Array.from({length: n},(_, i) => {
		return generateShelterData(overide);
	});
};