import { randomUUID } from 'crypto';
import { Server } from 'http';
import request from 'supertest';

import { Assertions } from '../../utils/Assertions';

import { faker } from '@faker-js/faker/locale/pt_BR';
import { closeConnection, openConnection } from '../../../src/database/datasource/data-source';
import { Pet } from '../../../src/entities/Pet';
import { Shelter } from '../../../src/entities/Shelter';
import { User } from '../../../src/entities/User';
import { startServer } from '../../../src/server';
import { AgeUnit, PetType, Role, SizeVariety } from '../../../src/types/enums';
import { IShelter } from '../../../src/types/schemas';
import { cleanDatabase, saveShelter } from '../../utils/database';
import { generateShelterData, generateSheltersData, generateToken, generateUserData, getRandomEnum } from '../../utils/generate';

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

describe('Router to signup shelter', () => {
	beforeEach(async () => {
		await cleanDatabase();
	});

	it('responds CREATED and body should have an user object to /signup/abrigos', async () => {
		const payload = {
			user: {
				name: 'shelter test',
				email: 'shelter_test@mail.com',
				password: '12345678'
			}
		};

		const result = {
			delete_date: null,
			user: {
				email: payload.user.email,
				name: payload.user.name,
				role: 'shelter',
				phone: null,
				city: null,
				state: null,
				delete_date: null,
			}
		};

		const res = await request(server)
			.post('/signup/abrigos')
			.send(payload)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json');

		Assertions.created(res, result);
	});

	it('responds BADREQUEST to post /signup/abrigos with already registered existed email', async () => {
		let user = new User();
		const gUser = generateUserData({role:'shelter'});
		user = Object.assign(user, gUser);
		await user.save();

		const payload = {
			user: {
				name: 'shelter test',
				email: user.email,
				password: '12345678'
			}
		};

		const res = await request(server)
			.post('/signup/abrigos')
			.send(payload)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json');

		Assertions.signUPNotAllowed(res);
	});

	it('responds BadRequest to post /signup/abrigos with wrong json schema', async () => {
		const payload = {
			a: 'shelter test',
			b: 'shelter_test1@mail.com',
		};

		const res = await request(server)
			.post('/signup/abrigos')
			.send(payload)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json');

		Assertions.jsonSchemaError(res);
	});

});

describe('Router to retrieve shelters', () => {
	const shelters: Shelter[] = [];

	beforeAll(async () => {
		await cleanDatabase();

		for(const item of generateSheltersData(35, {
			shelter: {delete_date: null, inactive: false},
			pet: {delete_date: null},
			user: {delete_date: null},
		})){
			const shelter = await saveShelter(Object.assign(new Shelter(), item));
			shelters.push(shelter);
		}

	});

	it('responds OK and body should have a list of shelters when admin user get /abrigos', async () => {

		const res = await request(server)
			.get('/abrigos')
			.set('Authorization', `Bearer ${tokenAdmin}`);

		Assertions.retrieveCompleteListEntities(res, shelters);
	});

	it('responds OK and body should have a list of shelters when unauthenticated-user get /abrigos', async () => {

		const res = await request(server)
			.get('/abrigos');

		Assertions.retrieveCompleteListEntities(res, shelters, true);
	});

	test.each([
		['shelter-user not-owner of resource', Role.SHELTER, true],
		['shelter-user owner of resource', Role.SHELTER, false],
		['tutor-user', Role.ADMIN, false],
	])('responds OK and body should have a list of shelters when %s get /abrigos', async (key, role, owner) => {
		const res = await request(server)
			.get('/abrigos')
			.set('Authorization', `Bearer ${generateToken({
				role: role,
				id: owner? shelters[0].id : randomUUID()
			})}`);

		Assertions.retrieveCompleteListEntities(res, shelters, true);
	});

	test.each([
		[0], // 1
		[1],
		[2],
		[3],
		[4],
		[5],
	])('responds OK and body should have paginated list when get /abrigos?page=%s', async (page) => {
		const res = await request(server)
			.get(`/abrigos?page=${page}`)
			.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`);

		Assertions.retrieveCompleteListEntities(res, shelters, true, page);
	});
});

describe('Router to retrieve a shelter by id', () => {
	const shelters: Shelter[] = [];

	beforeAll(async () => {
		await cleanDatabase();

		for(const item of generateSheltersData(5)){
			const shelter = await saveShelter(Object.assign(new Shelter(), item));
			await shelter.save();
			shelters.push(shelter);
		}

	});

	const cases = [
		['admin-user', generateToken({role: Role.ADMIN}), false],
		['tutor-user', generateToken({role: Role.TUTOR}), true],
		['shelter-user', generateToken({role: Role.SHELTER}), true],
		['unauthenticated-user', undefined, true],
	];
	test.each(cases)('responds OK and body should have one shelter when %s get /abrigos/:id', async (key, token, removeSensitiveProperty) => {
		
		const shelter: Shelter = Object.assign(new Shelter(), generateShelterData({shelter: {delete_date: null}, pet:{delete_date: null, adopted: false}}));

		const expected = await saveShelter(shelter);

		let res;
		if(token === undefined)
		{
			res = await request(server)
				.get(`/abrigos/${expected.id}`);
		}
		else
			res = await request(server)
				.get(`/abrigos/${expected.id}`)
				.set('Authorization', `Bearer ${token}`);

		Assertions.retrieveEntity(res, expected, removeSensitiveProperty as boolean);
	});

	it('responds OK and body has "Não Encontrado" when user get /abrigos/:id with non-existent id', async () => {

		const res = await request(server)
			.get(`/abrigos/${randomUUID()}`)
			.set('Authorization', `Bearer ${tokenAdmin}`);

		Assertions.nonExistentId(res);
	});
});

describe('Router to update (put) a shelter by id', () => {
	let shelter = new Shelter();
	let payload: IShelter;
	
	beforeAll(async () => {
		await cleanDatabase();
	});
	
	beforeEach(async () => {
		shelter = await saveShelter(generateShelterData({}, true, 4) as Shelter);
		
		//should create new pet
		payload = generateShelterData({
			shelter: {id: shelter.id, userId: shelter.userId},
			pet: {shelterId: shelter.id, name: 'new_pet'},
			user: {id: shelter.userId}
		}, true, 1);

		payload.pets.push(
			{
				id: shelter.pets[0].id,
				shelterId: shelter.pets[0].shelterId,
				adopted: !shelter.pets[0].adopted,
				age: shelter.pets[0].age+1,
				age_unit: getRandomEnum(AgeUnit), 
				name: `altered ${faker.animal.dog()} ${faker.name.firstName()}`,
				size_variety: getRandomEnum(SizeVariety),
				type: getRandomEnum(PetType)
			}
		);
		payload.pets.push(shelter.pets[1]);
		payload.pets.push({...shelter.pets[2], id: randomUUID()});
	});

	it('responds OK and body should have shelter with updated data, containing 1 new pet, 1 altered pet, 1 removed pet, 1 replaced pet, WHEN admin-user put /abrigos/:id', async () => {

		const res = await request(server)
			.put(`/abrigos/${shelter.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.putShelterDone(res, payload);
		
		expect(res.body.pets.length).toBe(4);

		//altered existed pet
		expect((res.body.pets as Pet[]).some(p => 
			p.id === shelter.pets[0].id && 
			p.create_date !== p.update_date && // existent and altered
			p.age === shelter.pets[0].age + 1 &&
			p.name.startsWith('altered') &&
			!shelter.pets[0].name.startsWith('altered')
		)).toBe(true);

		//keep existent pet
		expect((res.body.pets as Pet[]).some(p => p.id === shelter.pets[1].id)).toBe(true);
		const pet = (res.body.pets as Pet[]).find(p => p.id === shelter.pets[1].id);
		pet!.create_date = shelter.pets[1].create_date;
		pet!.update_date = shelter.pets[1].update_date;
		expect(pet).toMatchObject(shelter.pets[1]);

		expect((res.body.pets as Pet[]).some(p => p.id === shelter.pets[2].id)).toBe(false);

		expect((res.body.pets as Pet[]).some(p => p.id === shelter.pets[3].id)).toBe(false);

		const p2 = await Pet.findOneBy({ id: shelter.pets[2].id});
		expect(p2).toBeNull();

		const p3 = await Pet.findOneBy({ id: shelter.pets[2].id});
		expect(p3).toBeNull();
	});

	it('responds OK and body should have shelter with no alteration to data, WHEN admin-user put /abrigos/:id', async () => {

		const res = await request(server)
			.put(`/abrigos/${shelter.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(shelter);

		Assertions.putShelterDone(res, shelter);

	});

	it('responds OK and body has "Não Encontrado" when put /abrigos/:id with non-existent id', async () => {
		const randId = randomUUID();
		payload.id = randId;
		payload.pets = payload.pets.map(pet => { pet.shelterId = randId; return pet;});
		const res = await request(server)
			.get(`/abrigos/${randId}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.nonExistentId(res);
	});

	it('responds UNAUTHORIZED when unauthenticated user put /abrigos/:id', async () => {

		const res = await request(server)
			.put(`/abrigos/${shelter.id}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.unauthenticated(res);
	});

	test.each([
		['shelter-user owner', true, Role.TUTOR], 
		['shelter-user not owner', false, Role.SHELTER], 
		['tutor-user', false, Role.TUTOR], 
	])('responds FORBIDDEN when %s of resource put /abrigos/:id', async (key, owner, role) => {
		
		const token = generateToken({id: owner? shelter.id : randomUUID(), role: role});

		const res = await request(server)
			.put(`/abrigos/${shelter.id}`)
			.set('Authorization', `Bearer ${token}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		if(role !== Role.SHELTER)
			Assertions.notAllowedRole(res);
		else{
			if(owner)
				Assertions.notAllowedEntityUpdate(res);
			else
				Assertions.restrictedToOwner(res);
		}
	});

	it('responds BADREQUEST When user put /abrigos/:id with replaced id', async () => {

		const res = await request(server)
			.put(`/abrigos/${shelter.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({ ...payload, id: randomUUID()});

		Assertions.idReplacement(res);
	});

	it('responds BADREQUEST when user put /abrigos/:id with replaced userId', async () => {

		const res = await request(server)
			.put(`/abrigos/${shelter.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({ ...payload, userId: randomUUID()});

		Assertions.idReplacement(res);
	});

	it('responds BADREQUEST When user put /abrigos/:id with replaced user.id', async () => {

		const res = await request(server)
			.put(`/abrigos/${shelter.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({ ...payload, user: {...payload.user, id: randomUUID()}});

		Assertions.idReplacement(res);
	});

	it('responds BADREQUEST When user put /abrigos/:id with replaced pet.shelterId', async () => {

		payload.pets[2].shelterId = randomUUID();

		const res = await request(server)
			.put(`/abrigos/${shelter.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.idReplacement(res);
	});

	it('responds BADREQUEST When user put /abrigos/:id with wrong schema', async () => {

		const res = await request(server)
			.put(`/abrigos/${shelter.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({ ...payload, any: 'some'});

		Assertions.jsonSchemaError(res);
	});
});

describe('Router to update (patch) a shelter by id', () => {
	let shelter = new Shelter();
	
	beforeAll(async () => {
		await cleanDatabase();
	});

	beforeEach(async () => {
		shelter = await saveShelter(generateShelterData({}, true, 4) as Shelter);
	});

	const cases: any[][] = [
		['id', {id: null}],
		['inactive', {inactive: faker.datatype.boolean()}],
		['user.id', {user: {id: null}}],
		['user.email', {user: {email: faker.internet.email()}}],
		['user.name', {user: {name: faker.name.fullName()}}],
		['user.password', {user: {password: faker.internet.password()}}],
		['user.role', {user: {role: Role.SHELTER}}],
		['user.city', {user: {city: faker.address.cityName()}}],
		['user.state', {user: {state: faker.address.stateAbbr()}}],
		['user.phone', {user: {phone: faker.phone.number('##########')}}],
		['user.delete_date', {user: {delete_date: faker.date.birthdate()}}],
		['pets.adopted', {pets: [{adopted: faker.datatype.boolean()}]}],
		['pets.age', {pets: [{age: faker.datatype.number()}]}],
		['pets.age_unit', {pets: [{age_unit: getRandomEnum(AgeUnit)}]}],
		['pets.name', { pets: [{name: faker.name.firstName()}]}],
		['pets.id', { pets: [{id: null}]}],
		['pets.shelterId', { pets: [{shelterId: null}]}],
		['pets.size_variety', { pets: [{size_variety: getRandomEnum(SizeVariety)}]}],
		['pets.type', { pets: [{type: getRandomEnum(PetType)}]}],
		['pets.create_date', { pets: [{create_date: faker.date.past().toString()}]}],
		['pets.update_date', { pets: [{update_date: faker.date.recent().toString()}]}],
		['pets.delete_date', { pets: [{delete_date: faker.date.future().toString()}]}],
	];

	const casesOnlyPermitteds: any[][] = [
		['inactive', {inactive: faker.datatype.boolean()}],
		['user.email', {user: {email: faker.internet.email()}}],
		['user.name', {user: {name: faker.name.fullName()}}],
		['user.city', {user: {city: faker.address.cityName()}}],
		['user.state', {user: {state: faker.address.stateAbbr()}}],
		['user.phone', {user: {phone: faker.phone.number('##########')}}],
		['pets.size_variety', { pets: [{size_variety: getRandomEnum(SizeVariety)}]}],
		['pets.type', { pets: [{type: getRandomEnum(PetType)}]}],
		['pets.adopted', {pets: [{adopted: faker.datatype.boolean()}]}],
		['pets.age', {pets: [{age: faker.datatype.number()}]}],
		['pets.age_unit', {pets: [{age_unit: getRandomEnum(AgeUnit)}]}],
		['pets.name', { pets: [{name: faker.name.firstName()}]}],
	];

	const casesNotPermitteds: any[][] = [
		['id', {id: null}],
		['user.id', {user: {id: null}}],
		['pets.id', { pets: [{id: null}]}],
		['pets.shelterId', { pets: [{shelterId: null}]}],
		['pets.create_date', { pets: [{create_date: faker.date.past().toString()}]}],
		['pets.update_date', { pets: [{update_date: faker.date.recent().toString()}]}],
		['pets.delete_date', { pets: [{delete_date: faker.date.future().toString()}]}],
		['user.delete_date', {user: {delete_date: faker.date.birthdate()}}],
		['user.password', {user: {password: faker.internet.password()}}],
		['user.role', {user: {role: Role.SHELTER}}],
		['user.delete_date', {user: {delete_date: faker.date.birthdate()}}],
	];

	test.each(cases)('responds OK when adm-user patch /abrigos/:id with property %s', async (key, payload) => {
		if(payload?.user !== undefined && payload?.user?.id === null){
			payload.user.id = shelter.user.id;
		}
		
		if(payload?.pets !== undefined){
			payload.pets[0].id = shelter.pets[0].id;

			if(payload.pets[0].shelterId === null)
				payload.pets[0].shelterId = shelter.pets[0].shelterId;
		}

		if(payload.id !== undefined && payload.id === null)
			payload.id = shelter.id;

		if(payload.userId !== undefined && payload.userId === null)
			payload.userId = shelter.userId;
		
		const res = await request(server)
			.patch(`/abrigos/${shelter.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.patchShelterDone(res, shelter, payload as Shelter);
	});

	test.each(casesOnlyPermitteds)('responds OK when shelter-user owner of resource patch /abrigos/:id with permitted property %s', async (key, payload) => {
		if(payload?.pets !== undefined)
			payload.pets[0].id = shelter.pets[0].id;

		const res = await request(server)
			.patch(`/abrigos/${shelter.id}`)
			.set('Authorization', `Bearer ${generateToken({id: shelter.userId, role: Role.SHELTER})}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.patchShelterDone(res, shelter, payload as Shelter);
	});

	test.each(casesNotPermitteds)('responds FORBIDDEN to shelter-user owner of resource patch /abrigos/:id with property %s', async (key, payload) => {

		if(payload?.user !== undefined && payload?.user?.id === null){
			payload.user.id = shelter.user.id;
		}
		
		if(payload?.pets !== undefined){
			payload.pets[0].id = shelter.pets[0].id;

			if(payload.pets[0].shelterId !== undefined && payload.pets[0].shelterId === null)
				payload.pets[0].shelterId = shelter.pets[0].shelterId;
		}

		if(payload.id !== undefined && payload.id === null)
			payload.id = shelter.id;

		if(payload.userId !== undefined && payload.userId === null)
			payload.userId = shelter.userId;
		
		const res = await request(server)
			.patch(`/abrigos/${shelter.id}`)
			.set('Authorization', `Bearer ${generateToken({id: shelter.userId, role: Role.SHELTER})}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.notAllowedPropertyUpdate(res);

	});

	test.each(casesOnlyPermitteds)('responds FORBIDDEN to shelter-user not onwer of resource patch /abrigos/:id with permitted property %s', async (key, payload) => {

		if(payload?.user !== undefined && payload?.user?.id === null){
			payload.user.id = shelter.user.id;
		}
		
		if(payload?.pets !== undefined)
			payload.pets[0].id = shelter.pets[0].id;

		if(payload.id !== undefined && payload.id === null)
			payload.id = shelter.id;

		const res = await request(server)
			.patch(`/abrigos/${shelter.id}`)
			.set('Authorization', `Bearer ${generateToken({role: Role.SHELTER})}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.restrictedToOwner(res);

	});

	it('responds UNAUTHORIZED to unauthenticated-user patch /abrigos:id', async () => {
		const res = await request(server)
			.patch(`/abrigos/${shelter.id}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({adopted: true});

		Assertions.unauthenticated(res);
	});

	test.each(casesOnlyPermitteds)('responds UNAUTHORIZED to tutor-user patch /abrigos:id with permitted property %s', async (key, payload) => {
		const res = await request(server)
			.patch(`/abrigos/${shelter.id}`)
			.set('Authorization', `Bearer ${generateToken({role: Role.TUTOR})}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.notAllowedRole(res);
	});

	it('responds BADREQUEST When a user patch /abrigos/:id with replaced id', async () => {

		const res = await request(server)
			.patch(`/abrigos/${shelter.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({ id: randomUUID()});

		Assertions.idReplacement(res);
	});

	it('responds BADREQUEST When a user patch /abrigos/:id with replaced userId', async () => {

		const res = await request(server)
			.patch(`/abrigos/${shelter.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({userId: randomUUID()});

		Assertions.idReplacement(res);
	});

	it('responds BADREQUEST When a user patch /abrigos/:id with replaced user.id', async () => {

		const res = await request(server)
			.patch(`/abrigos/${shelter.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({ user: {id: randomUUID()}});

		Assertions.idReplacement(res);
	});

	it('responds BADREQUEST When a user patch /abrigos/:id with replaced pet.id', async () => {

		const res = await request(server)
			.patch(`/abrigos/${shelter.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({ pets: [{id: randomUUID()}]});

		Assertions.idReplacement(res);
	});

	it('responds BADREQUEST When a user patch /abrigos/:id with replaced pet.shelterId', async () => {

		const res = await request(server)
			.patch(`/abrigos/${shelter.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({ pets: [{shelterId: randomUUID()}]});

		Assertions.idReplacement(res);
	});

	it('responds BADREQUEST When a user patch /abrigos/:id with wrong schema', async () => {

		const res = await request(server)
			.patch(`/abrigos/${shelter.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({any: 'some'});

		Assertions.jsonSchemaError(res);
	});

	it('responds BADREQUEST When a user patch /abrigos/:id with non-existent id', async () => {

		const res = await request(server)
			.patch(`/abrigos/${randomUUID()}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({inactive: true});

		Assertions.nonExistentId(res);
	});
});

describe('Router do delete a shelter by id', () => {
	let shelter = new Shelter();
	
	beforeAll(async () => {
		await cleanDatabase();
	});

	beforeEach(async () => {
		shelter = await saveShelter(generateShelterData({}, true, 4) as Shelter);
	});

	it('responds UNAUTHORIZED when unauthenticated user delete /abrigos/:id', async () => {
		const res = await request(server)
			.delete(`/abrigos/${shelter.id}`);

		Assertions.unauthenticated(res);
	});

	test.each([['tutor-user', Role.TUTOR]])('responds FORBIDDEN when %s delete /abrigos/:id', async (user, role) => {
		const token = generateToken({id: randomUUID(), role: role});

		const res = await request(server)
			.delete(`/abrigos/${shelter.id}`)
			.set('Authorization', `Bearer ${token}`);

		Assertions.notAllowedRole(res);
	});

	test.each([['shelter-user', Role.SHELTER]])('responds FORBIDDEN when %s delete /abrigos/:id', async (user, role) => {
		const token = generateToken({id: randomUUID(), role: role});

		const res = await request(server)
			.delete(`/abrigos/${shelter.id}`)
			.set('Authorization', `Bearer ${token}`);

		Assertions.restrictedToOwner(res);
	});


	test.each([['shelter-user', Role.SHELTER], ['adm-user', Role.ADMIN]])('responds OK and body should have delete_date when %s delete /abrigos/:id', async (user, role) => {
		
		const token = generateToken({id: role === Role.SHELTER? shelter.userId: randomUUID(), role: role});

		const res = await request(server)
			.delete(`/abrigos/${shelter.id}`)
			.set('Authorization', `Bearer ${token}`);

		Assertions.sofDelete(res);

		const pets = await Pet.findBy({shelterId: shelter.id});
		if(pets.length > 0)
		{
			expect(pets.some(p => p.delete_date === null || p.delete_date === '')).toBe(false);
		}

		const deletedUser = await User.findOneBy({id: shelter.userId});
		if(deletedUser !== null)
		{
			expect(deletedUser.delete_date).not.toBeUndefined();
			expect(deletedUser.delete_date).not.toBeNull();
		}

		const deletedShelter = await Shelter.findOneBy({id: shelter.id});
		if(deletedShelter !== null)
		{
			expect(deletedShelter.delete_date).not.toBeUndefined();
			expect(deletedShelter.delete_date).not.toBeNull();
		}
	});

	it('responds BADREQUEST when user delete /abrigos/:id already deleted', async () => {
		await shelter.softRemove();
		
		const res = await request(server)
			.delete(`/abrigos/${shelter.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`);

		Assertions.nonExistentId(res);

	});
	it('responds BADREQUEST when user delete /abrigos/:id non-existent id', async () => {
		const res = await request(server)
			.delete(`/abrigos/${randomUUID()}`)
			.set('Authorization', `Bearer ${tokenAdmin}`);

		Assertions.nonExistentId(res);
	});
});