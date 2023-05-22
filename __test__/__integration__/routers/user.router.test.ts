import { randomUUID } from 'crypto';
import { Server } from 'http';
import request from 'supertest';

import { Assertions } from '../../utils/Assertions';

import { closeConnection, openConnection } from '../../../src/database/datasource/data-source';
import { User } from '../../../src/entities/User';
import { startServer } from '../../../src/server';
import { Role } from '../../../src/types/enums';
import { IUser } from '../../../src/types/schemas';
import { HTTP_RESPONSE } from '../../utils/consts';
import { generateToken, generateUserData, generateUsersData } from '../../utils/generate';
import { cleanDatabase } from '../../utils/database';
import { passwordToHash } from '../../../src/services/passwords';
import { faker } from '@faker-js/faker/locale/pt_BR';

let server: Server;

beforeAll(async () => {
	server = startServer();
	await openConnection();
});

afterAll(() => {
	closeConnection();
	server.close();
});

describe('Router to signup for admin User', () => {

	beforeEach(async () => {
		await cleanDatabase();
	});

	it('Responds CREATED and body should have user object to post /signup', async () => {
		const payload = {
			name: 'admin test',
			email: 'admin_test@mail.com',
			password: '12345678'
		};

		const result = {
			email: payload.email,
			name: payload.name,
			role: 'admin',
			phone: null,
			city: null,
			state: null,
			delete_date: null,
		};

		const res = await request(server)
			.post('/signup')
			.send(payload)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json');

		Assertions.created(res, result);
	});

	it('responds BADREQUEST to post /signup for alerady registered email', async () => {
		let user = new User();
		user = Object.assign(user, generateUserData());
		await user.save();

		const payload = {
			name: 'admin test',
			email: user.email,
			password: '12345678'
		};

		const res = await request(server)
			.post('/signup')
			.send(payload)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json');

		console.debug(res.body);
		Assertions.signUPNotAllowed(res);
	});

	it('responds BADREQUEST to post /signup wrong json schema', async () => {
		const payload = {
			a: 'admin test',
			b: 'admin_test1@mail.com',
		};

		const res = await request(server)
			.post('/signup')
			.send(payload)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json');

		console.debug(res.body);
		Assertions.jsonSchemaError(res);
	});
});

describe('Router to login', () => {
	beforeAll(async () => {
		await cleanDatabase();
		
		let user = new User();
		user = Object.assign(user, generateUserData({email: 'admin@mail.com', password: passwordToHash('12345678')}));
		await user.save();
	});

	it('responds OK and body should have token to post /login', async () => {
		const payload = {
			email: 'admin@mail.com',
			password: '12345678'
		};

		const res = await request(server)
			.post('/login')
			.send(payload)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json');

		Assertions.doneOK(res);
		expect(res.body).not.toBeUndefined();
	});

	it('responds UNAUTHORIZED to post /login with wrong password', async () => {
		const payload = {
			email: 'admin@mail.com',
			password: '10345678'
		};

		const res = await request(server)
			.post('/login')
			.send(payload)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json');

		expect(res.statusCode).toBe(HTTP_RESPONSE.Unauthorized);
		expect(res.body['message']).toBe('Invalid credentials');
	});

	it('responds UNAUTHORIZED to post /login with not registered email', async () => {
		const payload = {
			email: 'not-exist@mail.com',
			password: '12345678'
		};

		const res = await request(server)
			.post('/login')
			.send(payload)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json');

		console.debug(res.body);
		expect(res.statusCode).toBe(HTTP_RESPONSE.Unauthorized);
		expect(res.body['message']).toBe('Invalid credentials');
	});

	it('responds BADREQUEST to post /login with wrong Schema', async () => {
		const payload = {
			a: 'admintest@mail.com',
			b: '12345678',
			anyProperty: 'something'
		};

		const res = await request(server)
			.post('/login')
			.send(payload)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json');

		console.debug(res.body);
		Assertions.jsonSchemaError(res);
	});
});

describe('Retrive users', () => {
	const users: User[] = [];
	
	beforeAll(async () => {
		await cleanDatabase();
		
		users.push(...(generateUsersData(5, {role: Role.ADMIN, delete_date: null}) as User[]));
		users.push(...(generateUsersData(2, {role: Role.TUTOR, delete_date: null}) as User[]));
		users.push(...(generateUsersData(2, {role: Role.SHELTER, delete_date: null}) as User[]));
		
		for(const user of users)
			await new User(user).save();
	});

	describe('Router to retrive users', () => {
		it('responds OK and body should have a list of users when admin user get /users', async () => {
			const res = await request(server)
				.get('/users')
				.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`);

			Assertions.retrieveCompleteListEntities(res, users);
		});

		test.each([
			['tutor-user', Role.TUTOR],
			['shelter-user', Role.SHELTER],
		])('responds OK and body should have a list with one user when %s to get /users', async (key, role) => {
			const filteredUsers = users.filter( u => u.role === role);

			const res = await request(server)
				.get('/users')
				.set('Authorization', `Bearer ${generateToken({id:filteredUsers[0].id, role: role})}`);

			Assertions.retrieveRestrictedListOwnedEntities(res, [filteredUsers[0]]);
		});

		it('responds UNAUTHORIZED to get /users when unauthenticated', async () => {
			const res = await request(server)
				.get('/users');

			Assertions.unauthenticated(res);
		});
	});

	describe('Router to retrive user by id', () => {
		let user: User;

		test.each([
			['admin-user', Role.ADMIN, false],
			['admin-user', Role.ADMIN, true],
			['tutor-user', Role.TUTOR, true],
			['shelter-user', Role.SHELTER, true],
		])('responds OK and body should have one user when %s get /users/:id', async (key, role, owner) => {
			user = users.filter(u => u.role === role)[0];
			const res = await request(server)
				.get(`/users/${user.id}`)
				.set('Authorization', `Bearer ${generateToken({
					role: role,
					id: owner? user.id : randomUUID()
				})}`);

			console.debug(res.body);
			Assertions.retrieveEntity(res, user);
		});

		it('responds OK and body should return "Não Encontrado" when user get /users/:id with non-existent id', async () => {
			const res = await request(server)
				.get(`/users/${randomUUID()}`)
				.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`);

			console.debug(res.body);
			Assertions.nonExistentId(res);
		});

		it('responds UNAUTHORIZED when unauthenticated user get /user:id', async () => {
			console.debug('user.id');
			console.debug(user.id);
			const res = await request(server)
				.get(`/users/${user.id}`);
		
			Assertions.unauthenticated(res);
		});

		test.each([
			['tutor-user', Role.TUTOR],
			['shelter-user', Role.SHELTER],
		])('responds FORBIDDEN when shelter-user not owner of resource get /users/:id', async (key, role) => {
			const res = await request(server)
				.get(`/users/${user.id}`)
				.set('Authorization', `Bearer ${generateToken({role: role})}`);

			console.debug(res.body);
			Assertions.restrictedToOwner(res);
		});
	});
});

describe('Router to update (put) user', () => {
	let payload: IUser;
	const tokenShelter = generateToken({role: Role.SHELTER});
	const tokenTutor = generateToken({role: Role.TUTOR});
	
	beforeAll(async () => {
		await cleanDatabase();
	});

	beforeEach(async () => {
		let user = new User();
		user = Object.assign(user, generateUserData());
		await user.save();

		payload = generateUserData({id: user.id});
	});

	it('responds OK and body should have user with new data when admin-user put /users/:id', async () => {
		
		const res = await request(server)
			.put(`/users/${payload.id}`)
			.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`)
			.send(payload);

		console.debug(res.body);
		Assertions.putUserDone(res, payload);
	});

	it('responds UNAUTHORIZED when unauthenticated-user put /users/:id', async () => {
		
		const res = await request(server)
			.put(`/users/${payload.id}`)
			.send(payload);

		console.debug(res.body);
		Assertions.unauthenticated(res);
	});
	
	it('responds BADREQUEST when user put /users/:id with non-existent id', async () => {

		const res = await request(server)
			.put(`/users/${randomUUID()}`)
			.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`)
			.send(payload);

		console.debug(res.body);
		Assertions.nonExistentId;
	});

	it('responds BADREQUEST when user put /users/:id with wrong json schema', async () => {

		const res = await request(server)
			.put(`/users/${payload.id}`)
			.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`)
			.send({
				id: payload.id,
				any: 'a text',
				some: 9,
				maybe: true
			});

		console.debug(res.body);
		Assertions.jsonSchemaError(res);
	});

	it('responds BADREQUEST when user put /users/:id with replaced id ', async () => {
		const res = await request(server)
			.put(`/users/${payload.id}`)
			.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`)
			.send({...payload, id: randomUUID()});

		Assertions.idReplacement(res);
	});
	
	it('responds FORBIDDEN when tutor-user owned of resource put /users/:id', async () => {
		const res = await request(server)
			.put(`/users/${payload.id}`)
			.set('Authorization', `Bearer ${generateToken({id: payload.id, role: Role.TUTOR})}`)
			.send(payload);

		Assertions.notAllowedEntityUpdate(res);
	});
	
	it('responds FORBIDDEN when shelter-user owned of resource put /users/:id', async () => {
		const res = await request(server)
			.put(`/users/${payload.id}`)
			.set('Authorization', `Bearer ${generateToken({id: payload.id, role: Role.SHELTER})}`)
			.send(payload);

		Assertions.notAllowedEntityUpdate(res);
	});

	it('responds FORBIDDEN when token-user not owner of resource put /users/:id', async () => {
		const res = await request(server)
			.put(`/users/${payload.id}`)
			.set('Authorization', `Bearer ${tokenTutor}`)
			.send(payload);

		Assertions.restrictedToOwner(res);
	});

	it('responds FORBIDDEN when shelter-user not owner of resource put /users/:id', async () => {
		const res = await request(server)
			.put(`/users/${payload.id}`)
			.set('Authorization', `Bearer ${tokenShelter}`)
			.send(payload);

		Assertions.restrictedToOwner(res);
	});
});

describe('Router to update (patch) user', () => {
	let user = new User();

	beforeEach(async () => {
		await cleanDatabase();
		user = Object.assign(user, generateUserData());
		await user.save();
	});


	const cases: any[][] = [
		['email', {email: faker.internet.email()}],
		['name', {name: faker.name.fullName()}],
		['password', {password: faker.internet.password()}],
		['role', {role: Role.SHELTER}],
		['city', {city: faker.address.cityName()}],
		['state', {state: faker.address.stateAbbr()}],
		['phone', {phone: faker.phone.number('##########')}],
		['delete_date', {delete_date: faker.date.birthdate()}]
	];

	const casesOnlyPermitteds: any[][] = [
		['email', {email: faker.internet.email()}],
		['name', {name: faker.name.fullName()}],
		['city', {city: faker.address.cityName()}],
		['state', {state: faker.address.stateAbbr()}],
		['phone', {phone: faker.phone.number('##########')}],
	];

	const casesNotPermitteds: any[][] = [
		['role', {role: Role.SHELTER}],
		['password', {password: faker.internet.password()}],
		['delete_date', {delete_date: faker.date.birthdate()}]
	];

	test.each(cases)('responds OK and body have user with new %s when admin-user patch /users/:id', async (key, payload) => {

		const res = await request(server)
			.patch(`/users/${user.id}`)
			.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`)
			.send(payload);

		Assertions.patchUserDone(res, user, payload as User);
	});

	test.each([...casesOnlyPermitteds.reduce((prev, curr) => {
		prev.push(['tutor-user', ...curr, Role.TUTOR]);
		prev.push(['shelter-user', ...curr, Role.SHELTER]);

		return prev;
	}, [])])('responds OK and body have user with new data when %s owner patch /users/:id with permitted property %s', async (userKey, key, payload, role) => {

		const res = await request(server)
			.patch(`/users/${user.id}`)
			.set('Authorization', `Bearer ${generateToken({id: user.id, role: role})}`)
			.send(payload);

		console.debug(res.body);
		Assertions.patchUserDone(res, user, payload as User);
	});

	test.each([...casesNotPermitteds.reduce((prev, curr) => {
		prev.push(['tutor-user', ...curr, Role.TUTOR]);
		prev.push(['shelter-user', ...curr, Role.SHELTER]);

		return prev;
	}, [])])('responds OK and body have user with new date when %s owner of resource patch /users/:id with not-permitted property %s', async (userKey, key, payload, role) => {

		const res = await request(server)
			.patch(`/users/${user.id}`)
			.set('Authorization', `Bearer ${generateToken({id: user.id, role: role})}`)
			.send(payload);

		console.debug(res.body);
		Assertions.notAllowedPropertyUpdate(res);
	});
	
	it('responds BADREQUEST to patch /users/:id with wrong json schema', async () => {

		const res = await request(server)
			.patch(`/users/${user.id}`)
			.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`)
			.send({
				any: 'a text',
				some: 9,
				maybe: true
			});

		console.debug(res.body);
		Assertions.jsonSchemaError(res);
	});

	it('responds BADREQUEST to patch /users/:id when admind-user attempts to update id ', async () => {
		const res = await request(server)
			.patch(`/users/${user.id}`)
			.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`)
			.send({id: randomUUID()});

		Assertions.idReplacement(res);
	});
	
	test.each([...casesOnlyPermitteds.reduce((prev, curr) => {
		prev.push(['tutor-user', ...curr, Role.TUTOR]);
		prev.push(['shelter-user', ...curr, Role.SHELTER]);	

		return prev;
	}, [])])('responds FORBIDDEN when %s not-owner of resource patch /users/:id with permitted properties', async (userKey, key, payload, role) => {
	
		user = Object.assign(user, generateUserData({role: role}));
		await user.save();

		const res = await request(server)
			.patch(`/users/${user.id}`)
			.set('Authorization', `Bearer ${generateToken({role: role})}`)
			.send(payload);

		Assertions.restrictedToOwner(res);
	});

	it('responds UNAUTHORIZED when unauthenticated-user patch /users/:id', async () => {
		const res = await request(server)
			.patch(`/users/${user.id}`)
			.send(user);

		Assertions.unauthenticated(res);
	});

	it('responds BADREQUEST when user patch /users/:id with non-existent id', async () => {

		const res = await request(server)
			.patch(`/users/${randomUUID()}`)
			.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`)
			.send(user);

		console.debug(res.body);
		Assertions.nonExistentId(res);
	});
});

describe('Router to delete user', () => {
	let user = new User();
	
	beforeAll(async () => {
		await cleanDatabase();
	});
	
	beforeEach(async () => {
		user = Object.assign(user, generateUserData());
		await user.save();
	});

	it('responds UNAUTHORIZED when unauthenticated-user delete /users/:id', async () => {
		const res = await request(server).delete(`/users/${user.id}`);

		console.debug(res.body);
		Assertions.unauthenticated(res);
	});

	it('responds FORBIDDEN tutor-user owner of resource delete /users/:id', async () => {
		const token = generateToken({
			id: user.id, 
			role: Role.TUTOR
		});

		const res = await request(server)
			.delete(`/users/${user.id}`)
			.set('Authorization', `Bearer ${token}`);
		console.debug(res.body);
		Assertions.notAllowedRole(res);
	});

	it('responds FORBIDDEN shelter-user owner of resource delete /users/:id', async () => {
		const token = generateToken({
			id: user.id, 
			role: Role.SHELTER
		});

		const res = await request(server)
			.delete(`/users/${user.id}`)
			.set('Authorization', `Bearer ${token}`);

		console.debug(res.body);
		Assertions.notAllowedRole(res);
	});

	test.each([['tutor-user', Role.TUTOR],['shelter-user', Role.SHELTER]])('responds FORBIDDEN %s not owner of resource delete /users/:id', async (key, role) => {
		const res = await request(server)
			.delete(`/users/${user.id}`)
			.set('Authorization', `Bearer ${generateToken({role: role})}`);
		console.debug(res.body);
		Assertions.notAllowedRole(res);
	});

	it('responds Ok when admin-user delete /users/:id', async () => {
		const res = await request(server)
			.delete(`/users/${user.id}`)
			.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`);

		console.debug(res.body);
		Assertions.delete(res);
	});

	it('responds BadRequest to delete /users/:id already deleted', async () => {
			
		await user.softRemove();

		const res = await request(server)
			.delete(`/users/${user.id}`)
			.set('Authorization', `Bearer ${generateToken({role: Role.ADMIN})}`);

		console.debug(res.body);
		Assertions.nonExistentId(res);
	});
});