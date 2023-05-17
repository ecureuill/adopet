import { dataSource } from '../../src/database/datasource/data-source';
import { Pet } from '../../src/entities/Pet';
import { Shelter } from '../../src/entities/Shelter';
import { Tutor } from '../../src/entities/Tutor';
import { User } from '../../src/entities/User';
import { Role } from '../../src/types/enums';
import { IPet, IUser } from '../../src/types/schemas';

export const cleanDatabase = async () => {
	try {
		const entities = dataSource.entityMetadatas;
		const tableNames = entities.map((entity) => `"${entity.tableName}"`).join(', ');

		await  dataSource.query(`TRUNCATE ${tableNames} CASCADE;`);
		console.log('[TEST DATABASE]: Clean');
	} catch (error) {
		throw new Error(`ERROR: Cleaning test database: ${error}`);
	}
};

export const seedDatabase = async () => {
	try {
		const userAdm = new User({
			email: 'admin@mail.com',
			password: '$2b$10$K0cE8twY6HLmiLCo1KO10ufqwfaeZOuFcafRfBl2ejnjf0UsjjTBW',
			name: 'admin',
			role: Role.ADMIN
		} as IUser);

		await userAdm.save();

		const userShelter = new User({
			email: 'abrigo@mail.com',
			password: '$2b$10$K0cE8twY6HLmiLCo1KO10ufqwfaeZOuFcafRfBl2ejnjf0UsjjTBW',
			name: 'abrigo',
			role: Role.SHELTER
		} as IUser);

		const shelter = new Shelter();
		shelter.user = userShelter;

		await shelter.save();
		
		const userTutor = new User({
			email: 'tutor@mail.com',
			password: '$2b$10$K0cE8twY6HLmiLCo1KO10ufqwfaeZOuFcafRfBl2ejnjf0UsjjTBW',
			name: 'tutor',
			role: Role.TUTOR
		} as IUser);

		const tutor = new Tutor();
		tutor.user = userTutor;

		await tutor.save();

		console.log('[TEST DATABASE]: Seed');
	}
	catch (error) {
		throw new Error(`ERROR: Seeding test database: ${error}`);
	}
};

export const seedDataBaseTutors = async (count = 3) => {
	const tutors: string[] = [];

	for(let i = 1; i <=count; i++ ){
		const userTutor = new User({
			email: `tutor_${i}@mail.com`,
			password: '$2b$10$K0cE8twY6HLmiLCo1KO10ufqwfaeZOuFcafRfBl2ejnjf0UsjjTBW',
			name: `tutor_${1}`,
			role: Role.TUTOR
		} as IUser);

		let tutor = new Tutor();
		tutor.user = userTutor;

		tutor = await tutor.save();

		console.log('[TEST DATABASE]: Seed Tutor');
		console.log(tutor);
		tutors.push(tutor.id);
		console.debug(tutor.id);
		console.debug(tutors);
	}

	return tutors;
};

export const seedDataBaseShelters = async (count = 3) => {
	const shelters: string[] = [];

	for(let i = 1; i <=count; i++ ){
		const userShelter = new User({
			email: `abrigo_${i}@mail.com`,
			password: '$2b$10$K0cE8twY6HLmiLCo1KO10ufqwfaeZOuFcafRfBl2ejnjf0UsjjTBW',
			name: `abrigo_${1}`,
			role: Role.SHELTER
		} as IUser);

		let shelter = new Shelter();
		shelter.user = userShelter;
		shelter.pets = [];

		shelter = await shelter.save();

		console.log('[TEST DATABASE]: Seed Shelter');
		console.log(shelter);
		shelters.push(shelter.id);
		console.debug(shelter.id);
		console.debug(shelters);
	}

	return shelters;
};

export const seedDataBasePets = async (count = 3) => {
	const userShelter = new User({
		email: 'abrigo_pet@mail.com',
		password: '$2b$10$K0cE8twY6HLmiLCo1KO10ufqwfaeZOuFcafRfBl2ejnjf0UsjjTBW',
		name: 'abrigo_pet',
		role: Role.SHELTER,
	} as IUser);

	let shelter = new Shelter();
	shelter.user = userShelter;
	shelter.pets = [];

	shelter = await shelter.save();

	for(let i = 1; i <=count; i++ ){
		shelter.pets.push(new Pet({
			adopted: false,
			age: i,
			age_unit: 'y',
			size_variety: 'm',
			type: 'dog',
			name: `pet_${i}`,
			shelterId: shelter.id

		} as IPet));
	}
		
	shelter = await shelter.save();
	console.log('[TEST DATABASE]: Seed Pets');

	return shelter.pets.map(p => p.id);
};

export const seedDataBaseAdmins = async (count = 3) => {
	const admins: string[] = [];

	for(let i = 1; i <=count; i++ ){
		const userAdmin = new User({
			email: `admin_${i}@mail.com`,
			password: '$2b$10$K0cE8twY6HLmiLCo1KO10ufqwfaeZOuFcafRfBl2ejnjf0UsjjTBW',
			name: `admin_${1}`,
			role: Role.ADMIN
		} as IUser);

		admins.push((await userAdmin.save()).id);
	}
	return admins;
};

export const cleanAndSeedDatabase = async (count = 0) => {
	try{

		await cleanDatabase();
		await seedDatabase();
		
		const users = await User.find();
		if(users.length !== 3)
			throw new Error('ERROR: Seeding test database: users.length !== 3');

		return {
			admins:await seedDataBaseAdmins(count),
			tutors:await seedDataBaseTutors(count),
			shelters:await seedDataBaseShelters(count),
			pets: await seedDataBasePets(count)
		};
	}
	catch(error)
	{
		console.error(error);
		throw error;
	}
};

export const findUserByShelterId = async (shelterId: string) => {

	const shelter = await Shelter.findOneByOrFail({id : shelterId});

	return await User.findOneByOrFail({id: shelter.userId});
};

export const findUserByTutorId = async (tutorId: string) => {

	const tutor = await Tutor.findOneByOrFail({id : tutorId});

	return await User.findOneByOrFail({id: tutor.userId});
};

export const findShelterByUserEmail = async (email: string) => {

	const user = await User.findOneByOrFail({email: email});
	return await Shelter.findOneOrFail( {
		where: {userId: (await user).id},
		relations: { user: true, pets: true}
	});
};