import { randomUUID } from 'crypto';
import { Server } from 'http';
import request from 'supertest';

import { findTutorUserAndCreateToken } from '../../utils';
import { Assertions } from '../../utils/Assertions';
import { cleanDatabase } from '../../utils/database';

import { faker } from '@faker-js/faker/locale/pt_BR';
import { closeConnection, openConnection } from '../../../src/database/datasource/data-source';
import { Tutor } from '../../../src/entities/Tutor';
import { User } from '../../../src/entities/User';
import { startServer } from '../../../src/server';
import { Role } from '../../../src/types/enums';
import { generateToken, generateTutorData, generateTutorsData, generateUserData } from '../../utils/generate';

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

describe('Router to signup tutor user', () => {
	beforeEach(async () => {
		await cleanDatabase();
	});

	it('Responds CREATED and body should have an user object to post /signup/tutores', async () => {
		const payload = {
			user: {
				name: 'tutor test',
				email: 'tutor_test@mail.com',
				password: '12345678'
			}
		};

		const result = {
			user: {
				email: payload.user.email,
				name: payload.user.name,
				role: 'tutor',
				phone: null,
				city: null,
				state: null,
				delete_date: null,
			}
		};

		const res = await request(server)
			.post('/signup/tutores')
			.send(payload)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json');

		console.debug(res.body);
		Assertions.created(res, result);
	});

	it('responds BADREQUEST to post /signup/tutores with already registered existed email', async () => {
		
		let user = new User();
		user = Object.assign(user, generateUserData());
		await user.save();

		const payload = {
			user:{
				name: 'tutor test',
				email: user.email,
				password: '12345678'
			}
		};

		const res = await request(server)
			.post('/signup/tutores')
			.send(payload)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json');

		console.debug(res.body);
		Assertions.signUPNotAllowed(res);
	});

	it('responds BADREQUEST to post /signup/tutores with wrong json schema', async () => {
		const payload = {
			a: 'tutor test',
			b: 'tutor_test1@mail.com',
		};

		const res = await request(server)
			.post('/signup/tutores')
			.send(payload)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json');

		console.debug(res.body);
		Assertions.jsonSchemaError(res);
	});
});

describe('Router to retrieve tutors', () => {
	const users: Tutor[] = [];
	
	beforeAll(async () => {
		await cleanDatabase();

		for(const user of generateTutorsData(5)){
			const tutor = new Tutor();
			Object.assign(tutor, user);
			await tutor.save();
			users.push(tutor);
		}

	});

	it('responds OK and body should have a list of tutors when admin user get /tutores', async () => {

		const res = await request(server)
			.get('/tutores')
			.set('Authorization', `Bearer ${tokenAdmin}`);

		
		Assertions.retrieveCompleteListEntities(res, users);
	});

	it('responds OK and body has a list containing only one-owned tutor when tutor-user get /tutores ', async () => {
		
		const tutor = users[0];

		const res = await request(server)
			.get('/tutores')
			.set('Authorization', `Bearer ${generateToken({id: tutor.userId, role: Role.TUTOR })}`);

		Assertions.retrieveRestrictedListOwnedEntities(res, [tutor]);
	});

	it('responds UNAUTHORIZED when unauthenticated-user get /tutores', async () => {

		const res = await request(server)
			.get('/tutores');

		Assertions.unauthenticated(res);
	});

	it('responds FORBIDDEN when shelter-user get /tutores', async () => {

		const res = await request(server)
			.get('/tutores')
			.set('Authorization', `Bearer ${generateToken({role: Role.SHELTER})}`);

		Assertions.notAllowedRole(res);
	});
});

describe('Router to retrieve a tutor by id', () => {

	const tutors: Tutor[] = [];
	
	beforeAll(async () => {
		console.debug('beforeAll');
		await cleanDatabase();

		for(const data of generateTutorsData(5)){
			const tutor = new Tutor();
			Object.assign(tutor, data);
			await tutor.save();
			tutors.push(tutor);
		}

	});

	it('responds OK and body should have one tutor when admin user get /tutores/:id', async () => {

		const res = await request(server)
			.get(`/tutores/${tutors[0].id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`);

		Assertions.retrieveEntity(res, tutors[0]);
	});

	it('responds OK and body should have one tutor when tutor-user owner of the resource get /tutores/:id', async () => {

		const token = generateToken({id: tutors[0].userId, role: Role.TUTOR});

		const res = await request(server)
			.get(`/tutores/${tutors[0].id}`)
			.set('Authorization', `Bearer ${token}`);

		Assertions.retrieveEntity(res, tutors[0], true);
	});

	it('responds OK and body has "Não Encontrado" when user get /tutores/:id with non-existent id', async () => {

		const res = await request(server)
			.get(`/tutores/${randomUUID()}`)
			.set('Authorization', `Bearer ${tokenAdmin}`);

		Assertions.nonExistentId(res);
	});

	it('responds UNAUTHORIZED when unauthenticated-user get /tutores/:id', async () => {

		const res = await request(server)
			.get(`/tutores/${tutors[0].id}`);

		Assertions.unauthenticated(res);
	});

	it('responds FORBIDDEN when tutor-user not owner of resourcer get /tutores/:id', async () => {

		const res = await request(server)
			.get(`/tutores/${tutors[0].id}`)
			.set('Authorization', `Bearer ${generateToken({role:  Role.TUTOR})}`);

		Assertions.restrictedToOwner(res);

	});

	it('responds FORBIDDEN when shelter-user get /tutores/:id', async () => {

		const res = await request(server)
			.get(`/tutores/${tutors[0].id}`)
			.set('Authorization', `Bearer ${generateToken({role:  Role.SHELTER})}`);

		Assertions.notAllowedRole(res);
	});
});

describe('Router to update (put) a tutor by id', () => {
	let tutor = new Tutor();
	let payload: any;
	
	beforeAll(async () => {
		await cleanDatabase();
	});

	beforeEach(async () => {
		const gtutor = generateTutorData();
		tutor = tutor = Object.assign(tutor, gtutor);
		tutor.user = gtutor.user as User;
		await tutor.save();

		payload = {
			id: tutor.id,
			userId: tutor.userId,
			user: generateUserData({id: tutor.userId, role: Role.TUTOR}),
			about: faker.lorem.paragraphs(),
			photo: null
		};
	});

	afterEach(async () => {
		await cleanDatabase();
	});

	it('responds OK and body should have tutor with updated date WHEN admin-user put /tutors/:id', async () => {

		const res = await request(server)
			.put(`/tutores/${tutor.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.putTutorDone(res, payload);

	});

	it('responds OK and body has "Não Encontrado" when put /tutores/:id with non-existent id', async () => {
		const randId = randomUUID();
		const res = await request(server)
			.get(`/tutores/${randId}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({
				...payload,
				id: randId
			});

		Assertions.nonExistentId(res);
	});

	it('responds UNAUTHORIZED when unauthenticated user put /tutores/:id', async () => {

		const res = await request(server)
			.put(`/tutores/${tutor.id}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.unauthenticated(res);
	});

	it('responds FORBIDDEN when tutor-user owner of resource put /tutores/:id', async () => {

		const res = await request(server)
			.put(`/tutores/${tutor.id}`)
			.set('Authorization', `Bearer ${await findTutorUserAndCreateToken(tutor.id)}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.notAllowedEntityUpdate(res);
	});

	it('responds FORBIDDEN when tutor-user not owner of resaource put /tutores/:id', async () => {

		const res = await request(server)
			.put(`/tutores/${tutor.id}`)
			.set('Authorization', `Bearer ${generateToken({role: Role.TUTOR})}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.restrictedToOwner(res);
	});

	it('responds FORBIDDEN when shelter-user put /tutores/:id', async () => {

		const res = await request(server)
			.put(`/tutores/${tutor.id}`)
			.set('Authorization', `Bearer ${generateToken({role: Role.SHELTER})}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.notAllowedRole(res);
	});

	it('responds BADREQUEST When user put /tutores/:id with replaced id', async () => {

		const res = await request(server)
			.put(`/tutores/${tutor.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({ ...payload, id: randomUUID()});

		Assertions.idReplacement(res);
	});

	it('responds BADREQUEST when user put /tutores/:id with replaced userId', async () => {

		const res = await request(server)
			.put(`/tutores/${tutor.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({ ...payload, userId: randomUUID()});

		Assertions.idReplacement(res);
	});

	it('responds BADREQUEST When user put /tutores/:id with replaced user.id', async () => {

		const pay = {
			...payload,
			user: {
				...payload.user,
				id: randomUUID()
			}
		};

		console.debug(pay);


		const res = await request(server)
			.put(`/tutores/${tutor.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(pay);

		Assertions.idReplacement(res);
	});

	it('responds BADREQUEST When user put /tutores/:id with wrong schema', async () => {

		const res = await request(server)
			.put(`/tutores/${tutor.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({ ...payload, any: 'some'});

		Assertions.jsonSchemaError(res);
	});
});

describe('Router to update (patch) a tutor by id', () => {
	let tutor = new Tutor();

	beforeAll(async () => {
		await cleanDatabase();
	});

	beforeEach(async () => {
		const gtutor = generateTutorData();
		tutor = Object.assign(tutor, gtutor);
		tutor.user = gtutor.user as User;
		await tutor.save();
	});

	const cases: any[][] = [
		['about', {about: faker.lorem.paragraphs()}],
		['photo', {photo: null}],
		['user.email', {user: {email: faker.internet.email()}}],
		['user.name', {user: {name: faker.name.fullName()}}],
		['user.password', {user: {password: faker.internet.password()}}],
		['user.role', {user: {role: Role.SHELTER}}],
		['user.city', {user: {city: faker.address.cityName()}}],
		['user.state', {user: {state: faker.address.stateAbbr()}}],
		['user.phone', {user: {phone: faker.phone.number('##########')}}],
		['user.delete_date', {user: {delete_date: faker.date.birthdate()}}],
	];

	const casesOnlyPermitteds: any[][] = [
		['about', {about: faker.lorem.paragraphs()}],
		['photo', {photo: null}],
		['user.email', {user: {email: faker.internet.email()}}],
		['user.name', {user: {name: faker.name.fullName()}}],
		['user.city', {user: {city: faker.address.cityName()}}],
		['user.state', {user: {state: faker.address.stateAbbr()}}],
		['user.phone', {user: {phone: faker.phone.number('##########')}}],
		['user.delete_date', {user: {delete_date: faker.date.birthdate()}}],
	];
		
	test.each(cases)('responds OK when adm-user patch /tutor/:id with %s', async (key, payload) => {
		const res = await request(server)
			.patch(`/tutores/${tutor.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.patchTutorDone(res, tutor, payload);

	});

	test.each(casesOnlyPermitteds)('responds OK when tutor-user owner of resource patch /tutor/:id with permitted property %s', async (key, payload) => {

		const res = await request(server)
			.patch(`/tutores/${tutor.id}`)
			.set('Authorization', `Bearer ${generateToken({id: tutor.userId, role: Role.TUTOR})}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.patchTutorDone(res, tutor,payload as Tutor);

	});

	test.each([
		['user.password', {user: {password: faker.internet.password()}}],
		['user.role', {user: {role: Role.SHELTER}}],
	])('responds FORBIDDEN to tutor-user patch /tutor/:id for owned resource with property %s', async (key, payload) => {

		const test = await Tutor.findOneBy({ id: tutor.id});

		console.debug(test);

		const res = await request(server)
			.patch(`/tutores/${tutor.id}`)
			.set('Authorization', `Bearer ${generateToken({id: tutor.userId, role: Role.TUTOR})}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.notAllowedPropertyUpdate(res);

	});

	test.each([
		['id', {user: {id: randomUUID()}}],
		['userId', {user: {id: randomUUID()}}],
	])('responds BADREQUEST to tutor-user patch /tutor/:id for owned resource with property %s', async (key, payload) => {

		const test = await Tutor.findOneBy({ id: tutor.id});

		console.debug(test);

		const res = await request(server)
			.patch(`/tutores/${tutor.id}`)
			.set('Authorization', `Bearer ${generateToken({id: tutor.userId, role: Role.TUTOR})}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.idReplacement(res);

	});

	it('responds FORBIDDEN to tutor-user not onwer of resource patch /tutor/:id', async () => {
		const payload = {
			about: 'altered',
		};

		const res = await request(server)
			.patch(`/tutores/${tutor.id}`)
			.set('Authorization', `Bearer ${generateToken({role: Role.TUTOR})}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(payload);

		Assertions.restrictedToOwner(res);

	});

	it('responds UNAUTHORIZED to unauthenticated-user patch /tutor:id', async () => {
		const res = await request(server)
			.patch(`/tutores/${tutor.id}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({about: 'altered'});

		Assertions.unauthenticated(res);
	});

	it('responds UNAUTHORIZED to shelter user patch /tutor:id', async () => {
		const res = await request(server)
			.patch(`/tutores/${tutor.id}`)
			.set('Authorization', `Bearer ${generateToken({role: Role.SHELTER})}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({about: 'altered'});

		Assertions.notAllowedRole(res);
	});

	it('responds BADREQUEST When a user patch /tutores/:id with replaced id', async () => {

		const res = await request(server)
			.patch(`/tutores/${tutor.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({ about: 'altered', id: randomUUID()});

		Assertions.idReplacement(res);
	});

	it('responds BADREQUEST When a user patch /tutores/:id with replaced userId', async () => {

		const res = await request(server)
			.patch(`/tutores/${tutor.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({ about: 'altered', userId: randomUUID()});

		Assertions.idReplacement(res);
	});

	it('responds BADREQUEST When a user patch /tutores/:id with replaced user.id', async () => {

		const res = await request(server)
			.patch(`/tutores/${tutor.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({ about: 'altered', user: {id: randomUUID()}});

		Assertions.idReplacement(res);
	});

	it('responds BADREQUEST When a user patch /tutores/:id with wrong schema', async () => {

		const res = await request(server)
			.patch(`/tutores/${tutor.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({ any: 'some'});

		Assertions.jsonSchemaError(res);
	});

	it('responds BADREQUEST When a user patch /tutores/:id with non-existent id', async () => {

		const res = await request(server)
			.patch(`/tutores/${randomUUID()}`)
			.set('Authorization', `Bearer ${tokenAdmin}`)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({about: 'altered'});

		Assertions.nonExistentId(res);
	});
});

describe('Router do delete a tutor by id', () => {
	let tutor = new Tutor();

	beforeAll(async () => {
		await cleanDatabase();
	});

	beforeEach(async () => {
		const gtutor = generateTutorData({tutor: {delete_date: null}, user:{delete_date: null}});
		tutor = Object.assign(tutor, gtutor);
		tutor.user = gtutor.user as User;
		await tutor.save();
	});

	it('responds UNAUTHORIZED when unauthenticated user delete /tutores/:id', async () => {
		const res = await request(server)
			.delete(`/tutores/${tutor.id}`);

		console.debug(res.body);
		Assertions.unauthenticated(res);
	});

	test.each([
		['tutor-user', Role.TUTOR],
		['shelter-user', Role.SHELTER]
	])('responds FORBIDDEN when %s delete /tutores/:id', async (key, role) => {
		const res = await request(server)
			.delete(`/tutores/${tutor.id}`)
			.set('Authorization', `Bearer ${generateToken({role: role})}`);

		Assertions.notAllowedRole(res);
	});

	it('responds OK and tutor and user should be removed when adm-user delete /tutores/:id', async () => {


		const r: any = await Tutor.findOne({where: {id: tutor.id}, relations: {user: true}});
		expect(r).not.toBeNull();

		const res = await request(server)
			.delete(`/tutores/${tutor.id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`);

		Assertions.sofDelete(res);

		const deletedTutor = await Tutor.getRepository().createQueryBuilder('tutor').withDeleted().leftJoinAndSelect('tutor.user', 'user').where({id: tutor.id}).getOne();

		console.debug(deletedTutor);

		expect(deletedTutor).not.toBeNull();
		expect(deletedTutor!.delete_date).not.toBeNull();
		expect(deletedTutor!.user.delete_date).not.toBeNull();
	});

	it('responds BADREQUEST when user delete /tutores/:id already deleted', async () => {

		const id = tutor.id;
		await tutor.remove();

		const res = await request(server)
			.delete(`/tutores/${id}`)
			.set('Authorization', `Bearer ${tokenAdmin}`);

		Assertions.nonExistentId(res);

	});
});