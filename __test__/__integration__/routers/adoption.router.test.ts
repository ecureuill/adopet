import { Server } from 'http';
import request from 'supertest';

import { Assertions } from '../../utils/Assertions';
import { cleanDatabase, findUserByShelterId, saveAdoption, saveShelter, saveTutor } from '../../utils/database';

import { closeConnection, openConnection } from '../../../src/database/datasource/data-source';
import { Adoption } from '../../../src/entities/Adoption';
import { Shelter } from '../../../src/entities/Shelter';
import { Tutor } from '../../../src/entities/Tutor';
import { startServer } from '../../../src/server';
import { Role } from '../../../src/types/enums';
import { generateAdoptionData, generateAdoptionsData, generatePetsData, generateShelterData, generateToken, generateTutorData } from '../../utils/generate';
import { randomUUID } from 'crypto';
import { Pet } from '../../../src/entities/Pet';

let server: Server;

beforeAll(async () => {
	server = startServer();
	await openConnection();
});

afterAll(() => {
	server.close();
	closeConnection();
});

const tokenAdmin = generateToken({role: Role.ADMIN});

describe('Router to create adoption', () => {
	let shelter: Shelter;
	let tutor: Tutor;
	let tokenShelter: string;

	beforeEach(async () => {
		await cleanDatabase();

		shelter = await saveShelter(generateShelterData({pet:{adopted: false} }, true, 5) as Shelter);
		tokenShelter = generateToken({id: shelter.userId, role: Role.SHELTER});

		tutor = await saveTutor(generateTutorData() as Tutor);

	});

	it('Responds CREATED and body should retrieve an adoption object when shelter-user owner of pet post /adocoes', async () => {
		const payload = {
			petId: shelter.pets[0].id,
			tutorId: tutor.id,
		};

		shelter.pets[0].adopted = true;
		const expected = new Adoption({
			pet: shelter.pets[0],
			petId: shelter.pets[0].id,
			tutorId: tutor.id,
			shelterId: shelter.id,

		});

		const res = await request(server)
			.post('/adocoes')
			.set('Authorization', `Bearer ${tokenShelter}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.created(res, expected);
	});

	it('Responds FORBIDDEN when shelter-user not-owner of pet post /adocoes', async () => {
		const payload = {
			petId: shelter.pets[0].id,
			tutorId: tutor.id,
		};

		const res = await request(server)
			.post('/adocoes')
			.set('Authorization', `Bearer ${generateToken({role: Role.SHELTER})}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.restrictedToOwner(res);
	});
	
	test.each([
		['tutor-user', Role.TUTOR],
		['admin-user', Role.ADMIN],
	])('Responds FORBIDDEN when %s post /adocoes', async (key, role) => {
		const payload = {
			petId: shelter.pets[0].id,
			tutorId: tutor.id,
		};

		const res = await request(server)
			.post('/adocoes')
			.set('Authorization', `Bearer ${generateToken({role:role})}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.notAllowedRole(res);
	});
	
	it('Responds FORBIDDEN when unauthenticated-user post /adocoes', async () => {
		const payload = {
			petId: shelter.pets[0].id,
			tutorId: tutor.id,
		};

		const res = await request(server)
			.post('/adocoes')
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.unauthenticated(res);
	});
	
	it('Responds BADREQUEST when shelter-user owner of pet post /adocoes with pet already adopted',async () => {

		const adoption = await saveAdoption(generateAdoptionData() as Adoption);

		const payload = {
			petId: adoption.petId,
			tutorId: tutor.id,
		};

		const res = await request(server)
			.post('/adocoes')
			.set('Authorization', `Bearer ${tokenShelter}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.adoptionNotAllowed(res);
	});

	it('Responds BADREQUEST when shelter-user owner of pet post /adocoes with inexistent tutorId', async () => {
		const payload = {
			petId: shelter.pets[0].id,
			tutorId: randomUUID(),
		};

		const res = await request(server)
			.post('/adocoes')
			.set('Authorization', `Bearer ${tokenShelter}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.nonExistentId(res);
	});

	it('Responds BADREQUEST when shelter-user owner of pet post /adocoes with inexistent petId', async () => {
		const payload = {
			petId: randomUUID(),
			tutorId: tutor.id,
		};

		const res = await request(server)
			.post('/adocoes')
			.set('Authorization', `Bearer ${tokenShelter}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.nonExistentId(res);
	});

	it('responds BADREQUEST to post /adocoes with wrong json schema', async () => {
		const payload = {
			a: tutor.id,
			petId: shelter.pets[0].id,
		} as Partial<Adoption>;

		const res = await request(server)
			.post('/adocoes')
			.set('Authorization', `Bearer ${tokenShelter}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.jsonSchemaError(res);
	});
});

describe('Router to cancel adoption', () => {
	let adoption: Adoption;
	let tokenShelter: string;

	beforeEach(async () => {
		await cleanDatabase();

		adoption = await saveAdoption(generateAdoptionData() as Adoption);

		tokenShelter = generateToken({id: (await findUserByShelterId(adoption.shelterId)).id, role: Role.SHELTER});
	});
	
	it('Responds OK when shelter-user owner of adoption delete /adocoes',async () => {

		const res = await request(server)
			.delete(`/adocoes/${adoption.id}`)
			.set('Authorization', `Bearer ${tokenShelter}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json');

		Assertions.doneOK(res);
		expect(res.body.pet.adopted).toBe(false);
	});
	

	it('Responds FORBIDDEN when shelter-user not-owner of pet delete /adocoes', async () => {

		const res = await request(server)
			.delete(`/adocoes/${adoption.id}`)
			.set('Authorization', `Bearer ${generateToken({role: Role.SHELTER})}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json');

		Assertions.restrictedToOwner(res);
	});
	
	test.each([
		['tutor-user', Role.TUTOR],
		['admin-user', Role.ADMIN],
	])('Responds FORBIDDEN when %s post /adocoes', async (key, role) => {
		const res = await request(server)
			.delete(`/adocoes/${adoption.id}`)
			.set('Authorization', `Bearer ${generateToken({role: role})}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json');

		Assertions.notAllowedRole(res);
	});
	
	it('Responds FORBIDDEN when unauthenticated-user post /adocoes', async () => {
		const res = await request(server)
			.delete(`/adocoes/${adoption.id}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json');

		Assertions.unauthenticated(res);
	});
	
	it('Responds BADREQUEST when shelter-user owner of pet delete /adocoes inexistent id',async () => {

		const res = await request(server)
			.delete(`/adocoes/${randomUUID()}`)
			.set('Authorization', `Bearer ${tokenShelter}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json');

		Assertions.nonExistentId(res);
	});

});

describe('Router to retrieve adoptions', () => {
	const allAdoptions: Adoption[] = [];
	const restrictedAdoptions: Adoption[] = [];
	let shelter: Shelter;

	beforeAll(async () => {
		await cleanDatabase();

		for(let adopt of generateAdoptionsData(5)){
			adopt = await saveAdoption(adopt as Adoption);
			(adopt.tutor as Partial<Tutor>).user = undefined;
			allAdoptions.push(adopt as Adoption);
		}

		restrictedAdoptions.push(...allAdoptions.filter(adpt => adpt.shelterId === allAdoptions[0].shelterId)
		);
		shelter = await Shelter.findOneOrFail({where: {id:allAdoptions[0].shelterId}, relations: { pets: true}});

		const adoption = await saveAdoption(generateAdoptionData() as Adoption, { shelter: shelter});

		(adoption.tutor as Partial<Tutor>).user = undefined;
		restrictedAdoptions.push(adoption);
		allAdoptions.push(adoption);

	});

	it('responds OK and body should have a list of adoptions when admin user get /adocoes', async () => {

		const res = await request(server)
			.get('/adocoes')
			.set('Authorization', `Bearer ${tokenAdmin}`);

		Assertions.retrieveCompleteListEntities(res, allAdoptions);
	});

	it('responds OK and body should have a restricted list of adoptions when shelter-user get /adocoes', async () => {

		const res = await request(server)
			.get('/adocoes')
			.set('Authorization', `Bearer ${generateToken({role: Role.SHELTER, id: shelter.userId})}`);

		Assertions.retrieveRestrictedListOwnedEntities(res, restrictedAdoptions);
	});

	it('responds OK and body should have no adoptions when shelter-user with no adoptions get /adocoes', async () => {

		const shelter = await saveShelter(generateShelterData() as Shelter);

		const res = await request(server)
			.get('/adocoes')
			.set('Authorization', `Bearer ${generateToken({role: Role.SHELTER, id: shelter.userId})}`);

		Assertions.doneOK;
		expect(res.body.mensagem).toBe('Não encontrado');
	});

	it('responds FORBIDDEN when tutor-user get /adocoes', async () => {

		const tutor = await saveTutor(generateTutorData() as Tutor);

		const res = await request(server)
			.get('/adocoes')
			.set('Authorization', `Bearer ${generateToken({role: Role.TUTOR, id: tutor.userId})}`);

		Assertions.notAllowedRole(res);
	});

	it('responds UNAUTHORIZED when unauthenticated-user get /adocoes', async () => {

		const tutor = await saveTutor(generateTutorData() as Tutor);

		const res = await request(server)
			.get('/adocoes');

		Assertions.unauthenticated(res);
	});
});

describe('Router to retrieve one adoption by id', () => {
	const allAdoptions: Adoption[] = [];

	beforeAll(async () => {
		await cleanDatabase();

		for(const adopt of generateAdoptionsData(5)){
			allAdoptions.push(await saveAdoption(adopt as Adoption));
		}
	});

	it('responds OK and body should have one adoptions when admin-user get /adocoes/:id', async () => {

		const res = await request(server)
			.get(`/adocoes/${allAdoptions[0].id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`);

		const adoption: Partial<Adoption> = allAdoptions[0];
		(adoption.tutor as Partial<Tutor>).user = undefined;

		Assertions.retrieveEntity(res, adoption);
	});

	it('responds OK and body should have one adoption when shelter-user owner of pet get /adocoes/:id', async () => {

		const adoption: Partial<Adoption> = allAdoptions[0];
		
		const res = await request(server)
			.get(`/adocoes/${allAdoptions[0].id}`)
			.set('Authorization', `Bearer ${generateToken({
				id: (await findUserByShelterId(adoption.shelterId!)).id,
				role: Role.SHELTER
			})}`);

		Assertions.retrieveEntity(res, adoption);
	});

	it('responds FORBIDDEN when shelter-user not-owner of pet get /adocoes/:id', async () => {
		const shelter = await saveShelter(generateShelterData() as Shelter);

		const res = await request(server)
			.get(`/adocoes/${allAdoptions[0].id}`)
			.set('Authorization', `Bearer ${generateToken({
				id: shelter.userId,
				role: Role.SHELTER
			})}`);

		Assertions.restrictedToOwner;
	});

	it('responds FORBIDDEN when tutor-user get /adocoes/:id', async () => {
		const tutor = await saveTutor(generateTutorData() as Tutor);

		const res = await request(server)
			.get(`/adocoes/${allAdoptions[0].id}`)
			.set('Authorization', `Bearer ${generateToken({
				id: tutor.userId,
				role: Role.TUTOR
			})}`);

		Assertions.notAllowedRole;
	});

	it('responds UNAUTHORIZED when unauthenticated-user get /adocoes/:id', async () => {
		const tutor = await saveTutor(generateTutorData() as Tutor);

		const res = await request(server)
			.get(`/adocoes/${allAdoptions[0].id}`);

		Assertions.unauthenticated(res);
	});
});

