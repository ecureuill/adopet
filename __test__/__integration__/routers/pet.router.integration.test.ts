import { randomUUID } from 'crypto';
import { Server } from 'http';
import request from 'supertest';

import { findShelterUserAndCreateToken } from '../../utils';
import { Assertions } from '../../utils/Assertions';
import { cleanDatabase, findUserByShelterId, saveShelter } from '../../utils/database';

import { faker } from '@faker-js/faker';
import { closeConnection, openConnection } from '../../../src/database/datasource/data-source';
import { Pet } from '../../../src/entities/Pet';
import { Shelter } from '../../../src/entities/Shelter';
import { startServer } from '../../../src/server';
import { AgeUnit, PetType, Role, SizeVariety } from '../../../src/types/enums';
import { IPet } from '../../../src/types/schemas';
import { generatePetData, generateShelterData, generateSheltersData, generateToken, getRandomEnum } from '../../utils/generate';

let server: Server;

beforeAll(async () => {
	server = startServer();
	await openConnection();
});

afterAll(() => {
	server.close();
	closeConnection();
});

describe('Router to retrieve pets', () => {
	let pets = Array<Pet>();

	beforeAll(async () => {
		await cleanDatabase();

		for(const item of generateSheltersData(5, { shelter: {delete_date: null}, pet: {delete_date: null}, user: {delete_date: null} })){
			const shelter = await saveShelter(Object.assign(new Shelter(), item));
		}

		pets = await Pet.find({relations: {shelter: true}});
	});

	describe('All pets', () => {

		test.each([
			['admin-user', Role.ADMIN],
			['tutor-user', Role.TUTOR],
			['shelter-user', Role.SHELTER],
		])('responds OK and body should have a list of pets when %s get /pets', async (key, role) => {

			const res = await request(server)
				.get('/pets')
				.set('Authorization', `Bearer ${generateToken({role: role})}`);
			
			Assertions.retrieveCompleteListEntities(res, pets, role !== Role.ADMIN);
		});

		it('responds OK and body should have a list of pets when unauthenticated-user get /pets', async () => {

			const res = await request(server)
				.get('/pets');

			Assertions.retrieveCompleteListEntities(res, pets, true);
		});
	});

	describe('One pet by id', () => {

		const cases = [
			['admin-user', Role.ADMIN, false],
			['tutor-user', Role.TUTOR, true],
			['shelter-user', Role.SHELTER, true],
			['unauthenticated-user', undefined, true],
		];

		test.each(cases)('responds OK and body should have one pet when %s get /pets/:id', async (key, role, removeSenstityProperties) => {
			
			const pet = pets[faker.datatype.number({min: 0, max: pets.length -1})];

			let res;
			if(role === undefined)
				res = await request(server)
					.get(`/pets/${pet.id}`);
			else
				res = await request(server)
					.get(`/pets/${pet.id}`)
					.set('Authorization', `Bearer ${generateToken({role: role as Role})}`);

			Assertions.retrieveEntity(res, pet, removeSenstityProperties as boolean);
		});

		it('responds OK and body has "Não Encontrado" when user get /pets/:id with non-existent id', async () => {

			const res = await request(server)
				.get(`/pets/${randomUUID()}`)
				.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`);

			Assertions.nonExistentId(res);
		});
	});
});

describe('Router to update a pet by id', () => {
	let pet: Pet;

	beforeEach(async () => {
		await cleanDatabase();

		const shelter = await saveShelter(Object.assign(new Shelter(), generateShelterData({ user: {}, pet: {}, shelter: {}}, true, 1)));

		pet = await Pet.findOneByOrFail({shelterId : shelter.id});
	});

	describe('put', () => {
		let payload: IPet;
			
		beforeEach(async () => {
			payload = generatePetData({
				id: pet.id,
				shelterId: pet.shelterId
			});
		});

		it('responds OK and body should have pet with updated data WHEN admin-user put /pets/:id', async () => {

			const res = await request(server)
				.put(`/pets/${pet.id}`)
				.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`)
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.send(payload);

			Assertions.putPetDone(res, payload);

		});

		it('responds OK and body has "Não Encontrado" when put /pets/:id with non-existent id', async () => {
			const randId = randomUUID();
			const res = await request(server)
				.get(`/pets/${randId}`)
				.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`)
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.send({
					...payload,
					id: randId
				});

			Assertions.nonExistentId(res);
		});

		it('responds UNAUTHORIZED when unauthenticated user put /pets/:id', async () => {

			const res = await request(server)
				.put(`/pets/${pet.id}`)
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.send(payload);

			Assertions.unauthenticated(res);
		});

		it('responds FORBIDDEN when shelter-user owner of resource put /pets/:id', async () => {

			const res = await request(server)
				.put(`/pets/${pet.id}`)
				.set('Authorization', `Bearer ${await findShelterUserAndCreateToken(pet.shelterId)}`)
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.send(payload);

			Assertions.notAllowedEntityUpdate(res);
		});

		it('responds FORBIDDEN when tutor-user put /pets/:id', async () => {

			const res = await request(server)
				.put(`/pets/${pet.id}`)
				.set('Authorization', `Bearer ${generateToken({role: Role.TUTOR})}`)
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.send(payload);

			Assertions.notAllowedRole(res);
		});

		it('responds FORBIDDEN when shelter-user not onwer of resource put /pets/:id', async () => {

			const res = await request(server)
				.put(`/pets/${pet.id}`)
				.set('Authorization', `Bearer ${generateToken({role: Role.SHELTER})}`)
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.send(payload);

			Assertions.restrictedToOwner(res);
		});

		it('responds BADREQUEST When user put /pets/:id with replaced id', async () => {

			const res = await request(server)
				.put(`/pets/${pet.id}`)
				.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`)
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.send({ ...payload, id: randomUUID()});

			Assertions.idReplacement(res);
		});

		it('responds BADREQUEST when user put /pets/:id with replaced shelterId', async () => {

			const res = await request(server)
				.put(`/pets/${pet.id}`)
				.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`)
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.send({ ...payload, shelterId: randomUUID()});

			Assertions.idReplacement(res);
		});

		it('responds BADREQUEST When user put /pets/:id with wrong schema', async () => {

			const res = await request(server)
				.put(`/pets/${pet.id}`)
				.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`)
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.send({ ...payload, any: 'some'});

			Assertions.jsonSchemaError(res);
		});
	});

	describe('patch', () => {

		const cases: any[][] = [
			['pets.adopted', {adopted: faker.datatype.boolean()}],
			['pets.age', {age: faker.datatype.number()}],
			['pets.age_unit', {age_unit: getRandomEnum(AgeUnit)}],
			['pets.name', {name: faker.name.firstName()}],
			['pets.id', {id: null}],
			['pets.shelterId', {shelterId: null}],
			['pets.size_variety', {size_variety: getRandomEnum(SizeVariety)}],
			['pets.type', {type: getRandomEnum(PetType)}],
			['pets.create_date', {create_date: faker.date.past().toISOString()}],
			['pets.update_date', {update_date: faker.date.recent().toISOString()}],
			['pets.delete_date', {delete_date: faker.date.future().toISOString()}],
		];

		const casesOnlyPermitteds: any[][] = [
			['pets.size_variety', {size_variety: getRandomEnum(SizeVariety)}],
			['pets.type', {type: getRandomEnum(PetType)}],
			['pets.age', {age: faker.datatype.number()}],
			['pets.age_unit', {age_unit: getRandomEnum(AgeUnit)}],
			['pets.name', {name: faker.name.firstName()}],
		];

		const casesNotPermitteds: any[][] = [
			['pets.id', {id: null}],
			['pets.shelterId', {shelterId: null}],
			['pets.create_date', {create_date: faker.date.past().toString()}],
			['pets.update_date', {update_date: faker.date.recent().toString()}],
			['pets.delete_date', {delete_date: faker.date.future().toString()}],
			['pets.adopted', {adopted: faker.datatype.boolean()}],
		];

		test.each(cases)('responds OK when adm-user patch /pets/:id with property %s', async (key, payload) => {

			if(payload.id !== undefined)
				payload.id = pet.id;

			if(payload.shelterId !== undefined)
				payload.shelterId = pet.shelterId;
			
			const res = await request(server)
				.patch(`/pets/${pet.id}`)
				.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`)
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.send(payload);

			Assertions.patchPetDone(res, pet, payload as Pet);
		});

		test.each(casesOnlyPermitteds)('responds OK when shelter-user owner of resource patch /pets/:id with permitted property %s', async (key, payload) => {

			if(payload.shelterId !== undefined)
				payload.shelterId = pet.shelterId;

			const res = await request(server)
				.patch(`/pets/${pet.id}`)
				.set('Authorization', `Bearer ${await findShelterUserAndCreateToken(pet.shelterId)}`)
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.send(payload);
				
			Assertions.patchPetDone(res, pet, payload);
		});

		test.each(casesNotPermitteds)('responds FORBIDDEN to shelter-user owner of resource patch /pets/:id with not-permitted property %s', async (key, payload) => {

			if(payload.id !== undefined)
				payload.id = pet.id;

			if(payload.shelterId !== undefined)
				payload.shelterId = pet.shelterId;

			const res = await request(server)
				.patch(`/pets/${pet.id}`)
				.set('Authorization', `Bearer ${await findShelterUserAndCreateToken(pet.shelterId)}`)
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.send(payload);
				
			Assertions.notAllowedPropertyUpdate(res);

		});

		test.each(casesOnlyPermitteds)('responds OK when shelter-user not-owner of resource patch /pets/:id with permitted property %s', async (key, payload) => {

			const res = await request(server)
				.patch(`/pets/${pet.id}`)
				.set('Authorization', `Bearer ${generateToken({role: Role.SHELTER})}`)
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.send(payload);
				
			Assertions.restrictedToOwner(res);
		});

		it('responds FORBIDDEN to tutor-user patch /tutor:id', async () => {
			const res = await request(server)
				.patch(`/pets/${pet.id}`)
				.set('Authorization', `Bearer ${generateToken({role: Role.TUTOR})}`)
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.send({name: 'pet'});

			Assertions.notAllowedRole(res);
		});

		it('responds UNAUTHORIZED to unauthenticated-user patch /pets:id', async () => {
			const res = await request(server)
				.patch(`/pets/${pet.id}`)
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.send({ id: pet.id});

			Assertions.unauthenticated(res);
		});

		it('responds BADREQUEST When a user patch /pets/:id with replaced id', async () => {

			const res = await request(server)
				.patch(`/pets/${pet.id}`)
				.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`)
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.send({ id: randomUUID()});

			Assertions.idReplacement(res);
		});

		it('responds BADREQUEST When a user patch /pets/:id with replaced shelterId', async () => {
			
			const res = await request(server)
				.patch(`/pets/${pet.id}`)
				.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`)
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.send({shelterId: randomUUID()});

			Assertions.idReplacement(res);
		});

		it('responds BADREQUEST When a user patch /pets/:id with wrong schema', async () => {

			const res = await request(server)
				.patch(`/pets/${pet.id}`)
				.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`)
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.send({ any: 'some'});

			Assertions.jsonSchemaError(res);
		});

		it('responds BADREQUEST When a user patch /pets/:id with non-existent id', async () => {

			const res = await request(server)
				.patch(`/pets/${randomUUID()}`)
				.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`)
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.send({name: 'skdjf'});

			Assertions.nonExistentId(res);
		});
	});
});

describe('Router do delete a pet by id', () => {
	let pet: Pet;

	beforeEach(async () => {
		await cleanDatabase();

		const shelter = await saveShelter(Object.assign(new Shelter(), generateShelterData({ user: {delete_date: null}, pet: {delete_date: null}, shelter: {delete_date: null}}, true, 1)));

		pet = await Pet.findOneByOrFail({shelterId : shelter.id});
	});
	
	it('responds UNAUTHORIZED when unauthenticated user delete /pets/:id', async () => {
		const res = await request(server)
			.delete(`/pets/${pet.id}`);

		Assertions.unauthenticated(res);
	});

	it('responds FORBIDDEN when tutor-user delete /pets/:id', async () => {
		const res = await request(server)
			.delete(`/pets/${pet.id}`)
			.set('Authorization', `Bearer ${generateToken({role: Role.TUTOR})}`);

		Assertions.notAllowedRole(res);
	});

	it('responds FORBIDDEN when shelter-user not-owner of resource delete /pets/:id', async () => {
		const res = await request(server)
			.delete(`/pets/${pet.id}`)
			.set('Authorization', `Bearer ${generateToken({role: Role.SHELTER})}`);

		Assertions.restrictedToOwner(res);
	});

	it('responds OK and body should have delete_date when tutor-user owner of resource delete /pets/:id', async () => {

		const res = await request(server)
			.delete(`/pets/${pet.id}`)
			.set('Authorization', `Bearer ${generateToken({id: (await findUserByShelterId(pet.shelterId)).id ,role: Role.SHELTER})}`);

		Assertions.sofDelete(res);

		const deletedPet = await Pet.getRepository().createQueryBuilder().withDeleted().where({id: pet.id}).getOne();
		expect(deletedPet).not.toBeNull();
		expect(deletedPet!.delete_date).not.toBeNull();
	});

	it('responds OK and body should have delete_date when adm user delete /pets/:id', async () => {

		const res = await request(server)
			.delete(`/pets/${pet.id}`)
			.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`);

		Assertions.sofDelete(res);

		const deletedPet = await Pet.getRepository().createQueryBuilder().withDeleted().where({id: pet.id}).getOne();
		expect(deletedPet).not.toBeNull();
		expect(deletedPet!.delete_date).not.toBeNull();
	});

	it('responds BADREQUEST when user delete /pets/:id already deleted', async () => {
		await pet.softRemove();

		const res = await request(server)
			.delete(`/pets/${pet.id}`)
			.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`);

		Assertions.nonExistentId(res);

	});
	it('responds BADREQUEST when user delete /pets/:id non-existent id', async () => {
		const res = await request(server)
			.delete(`/pets/${randomUUID()}`)
			.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`);

		Assertions.nonExistentId(res);
	});
});
