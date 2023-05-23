import { randomUUID } from 'crypto';
import { EntityNotFoundError, EntityPropertyNotFoundError, SelectQueryBuilder, TypeORMError } from 'typeorm';
import Controller, { settings } from '../../../src/controller';
import { closeConnection, openConnection } from '../../../src/database/datasource/data-source';
import { User } from '../../../src/entities/User';
import { Role } from '../../../src/types/enums';
import { generateUserData, generateUsersData } from '../../utils/generate';
import { getMockRepository } from '../../utils/mocks';
import { IdReplacementError, NotOwnerError } from '../../../src/utils/errors/business.errors';
import { MethodNotAllowedError, PatchPropertyAllowedError } from '../../../src/utils/errors/http.errors';

describe('Generic Controller', () => {
	let settings: settings;

	beforeEach(() => {
		settings = {
			userSettings: {
				authenticated: false,
				id: randomUUID(),
				permission: {
					granted: true,
					excluded: [],
					included: undefined,
					ownershipRequired: false
				},
				role: Role.ADMIN
			},
			idColumnName: 'id',
			ownerColumnName: 'id',
			alias: 'test'
		};
	});

	describe('constructor', () => {

		beforeAll(async () => {
			await openConnection();
		});

		afterAll(() => {
			closeConnection();
		});

		it('should instantiate controller with 2 args', () => {

			const controller = new Controller(settings, User);

			expect(controller.getIdColumnName()).toBe(settings.idColumnName);
			expect(controller.getOwnerColumnName()).toBe(settings.ownerColumnName);
			expect(controller.getAlias()).toBe(settings.alias);
			expect(controller.getUserSettings()).toBe(settings.userSettings);
			expect(controller.getRepository()).toBe(User.getRepository());

			expect(controller.getJoinQuery()).toEqual([]);
			expect(controller.getFnIsOwnerOrFail()).not.toBeUndefined();
			expect(controller.getFnGetOwnerIdByUserId()).not.toBeUndefined();


		});

		it('should instantiate controller with 3 args', () => {

			const joinQuery = [	
				{
					property: 'shelter.pets',
					alias: 'pets', 
				}, 
				{
					property: 'shelter.user',
					alias: 'user',
				}
			];
			const controller = new Controller(settings, User, joinQuery);

			expect(controller.getIdColumnName()).toBe(settings.idColumnName);
			expect(controller.getOwnerColumnName()).toBe(settings.ownerColumnName);
			expect(controller.getAlias()).toBe(settings.alias);
			expect(controller.getUserSettings()).toBe(settings.userSettings);
			expect(controller.getRepository().metadata.tableName).toBe(User.getRepository().metadata.tableName);
			expect(controller.getJoinQuery()).toEqual(joinQuery);

			expect(controller.getFnIsOwnerOrFail()).not.toBeUndefined();
			expect(controller.getFnGetOwnerIdByUserId()).not.toBeUndefined();


		});

		it('should instantiate controller with 5 args', () => {
			const fn1 = (entity: User, userId: string) => Promise.resolve(true);
			const fn2 = (userId: string) => Promise.resolve('test');

			const joinQuery = [	
				{
					property: 'shelter.pets',
					alias: 'pets', 
				}, 
				{
					property: 'shelter.user',
					alias: 'user',
				}
			];
			const controller = new Controller(settings, User, joinQuery, fn1, fn2);

			expect(controller.getIdColumnName()).toBe(settings.idColumnName);
			expect(controller.getOwnerColumnName()).toBe(settings.ownerColumnName);
			expect(controller.getAlias()).toBe(settings.alias);
			expect(controller.getUserSettings()).toBe(settings.userSettings);
			expect(controller.getRepository().metadata.tableName).toBe(User.getRepository().metadata.tableName);

			expect(controller.getJoinQuery()).toEqual(joinQuery);

			expect(controller.getFnIsOwnerOrFail()).toEqual(fn1);
			expect(controller.getFnGetOwnerIdByUserId()).toEqual(fn2);


		});

		it('should instantiate controller with 4 args', () => {
			const fn1 = (entity: User, userId: string) => Promise.resolve(true);
			const fn2 = (userId: string) => Promise.resolve('test');

			const controller = new Controller(settings, User, fn2, fn1);

			expect(controller.getIdColumnName()).toBe(settings.idColumnName);
			expect(controller.getOwnerColumnName()).toBe(settings.ownerColumnName);
			expect(controller.getAlias()).toBe(settings.alias);
			expect(controller.getUserSettings()).toBe(settings.userSettings);



			expect(controller.getRepository().metadata.tableName).toBe(User.getRepository().metadata.tableName);
			expect(controller.getJoinQuery()).toEqual([]);

			expect(controller.getFnIsOwnerOrFail()).toEqual(fn1);
			expect(controller.getFnGetOwnerIdByUserId()).toEqual(fn2);
		});
	});

	describe('db methods', () => {
	
		afterEach(() => {
			jest.restoreAllMocks();
		});

		describe('getAll', () => {
			let qb: jest.SpyInstance;
			const users = generateUsersData(3);

			beforeEach(() => {
				qb = jest.spyOn(SelectQueryBuilder.prototype, 'getManyAndCount');
			});

			it('should return list with 3 users', async () => {
				qb.mockReturnValue(Promise.resolve([users,3]));

				const controller = new Controller(settings, User);
				const {entities, count} = await controller.getAll();

				expect(entities).toBe(users);
				expect(count).toBe(3);
				expect(qb).toHaveBeenCalled();
			});

			it('should return []', async () => {
				qb.mockReturnValue(Promise.resolve([[],0]));
				
				const controller = new Controller(settings, User);
				const {entities, count} = await controller.getAll();

				expect(entities).toEqual([]);
				expect(count).toEqual(0);
				expect(qb).toHaveBeenCalled();
			});
		});

		describe('getOneById', () => {
			let qb: jest.SpyInstance;

			beforeEach(() => {
				qb = jest.spyOn(SelectQueryBuilder.prototype, 'getOneOrFail');
			});

			it('should return EntityPropertyNotFoundError', async () => {
				settings.idColumnName = 'non-existent-column';
				const controller = new Controller(settings, User);
				
				const result = controller.getOneById(randomUUID());
				
				await expect(result).rejects.toThrow(EntityPropertyNotFoundError);
			});

			it('should return ForbiddenError', async () => {
				const user = generateUserData();

				qb.mockReturnValue(Promise.resolve(user));

				settings.userSettings.permission.ownershipRequired = true;

				const controller = new Controller(settings, User);
				
				const result = controller.getOneById(randomUUID());
				
				await expect(result).rejects.toThrow(NotOwnerError);
			});

			it('should return EntityNotFoundError', async () => {
				qb.mockReturnValue(Promise.reject(new EntityNotFoundError(User, '0!=0')));

				const controller = new Controller(settings, User);
				const result = controller.getOneById(randomUUID());
				
				await expect(result).rejects.toThrow(EntityNotFoundError);
				expect(qb).toHaveBeenCalled();
			});

			it('should return user', async () => {
				const user = generateUserData();

				qb.mockReturnValue(Promise.resolve(user));
				
				const controller = new Controller(settings, User);
				const result = await controller.getOneById(user.id);

				expect(result).toEqual(user);
				expect(qb).toHaveBeenCalled();
			});

		});

		describe('updateAll', () => {

			it('should return EntityNotFoundError', async () => {
				const user = generateUserData() as User;

				const rep = getMockRepository(
					{method: 'getOneOrFail', value: new EntityNotFoundError(User, `id ${user.id}`), rejected: true}, 
					{method: 'save', value: new TypeORMError('Some TypeORMError'), rejected: true});

				const controller = new Controller(settings, User);
				const result = controller.updateAll(user, user.id);
				
				await expect(result).rejects.toThrow(TypeORMError);
				expect(rep).toHaveBeenCalledTimes(1);
			});

			it('should return ForbiddenError: Owner', async () => {
				const user = generateUserData() as User;

				settings.userSettings.permission.ownershipRequired = true;

				const controller = new Controller(settings, User);
				
				const result = controller.updateAll(user, user.id);
				
				await expect(result).rejects.toThrow(NotOwnerError);
			});

			it('should return ForbiddenError: PUT', async () => {
				const user = generateUserData() as User;

				settings.userSettings.permission.excluded =['city'];
				const controller = new Controller(settings, User);
				
				const result = controller.updateAll(user, user.id);
				
				await expect(result).rejects.toThrow(MethodNotAllowedError);
			});

			it('should return BADREQUEST: ID ', async () => {
				const user = generateUserData() as User;

				const controller = new Controller(settings, User);
				
				const result = controller.updateAll(user, randomUUID());
				
				await expect(result).rejects.toThrow(IdReplacementError);
			});

			it('should update user', async () => {
				const user = generateUserData() as User;

				const rep = getMockRepository(
					{method: 'getOneOrFail', value: user}, 
					{method: 'save', value: user});

				const controller = new Controller(settings, User);
				const result = await controller.updateAll(user, user.id);

				expect(result).toMatchObject(user);

				expect(rep).toHaveBeenCalled();
			});

			it('should throw TypeORMError on save', async () => {
				const user = generateUserData() as User;

				const rep = getMockRepository(
					{method: 'getOneOrFail', value: user}, 
					{method: 'save', value: new TypeORMError('Some TypeORMError'), rejected: true});
				
				const controller = new Controller(settings, User);
				const result = controller.updateAll(user, user.id);

				await expect(result).rejects.toThrow('Some TypeORMError');

				expect(rep).toHaveBeenCalled();
			});

		});

		describe('updateSome', () => {

			it('should return EntityNotFoundError', async () => {
				const user = generateUserData() as User;
				
				const rep = getMockRepository(
					{method: 'getOneOrFail', value: new EntityNotFoundError(User, `id ${user.id}`), rejected: true}, 
					{method: 'save', value: new TypeORMError('Some TypeORMError'), rejected: true});

				const controller = new Controller(settings, User);
				const result = controller.updateSome(user, user.id);
				
				await expect(result).rejects.toThrow(EntityNotFoundError);
				expect(rep).toHaveBeenCalled();
			});

			it('should return ForbiddenError: Owner', async () => {
				const user = generateUserData() as User;

				settings.userSettings.permission.ownershipRequired = true;
				
				const rep = getMockRepository(
					{method: 'getOneOrFail', value: user}, 
					{method: 'save', value: user});

				const controller = new Controller(settings, User);
				const result = controller.updateSome(user, user.id);

				await expect(result).rejects.toThrow(NotOwnerError);
				expect(rep).toHaveBeenCalled();
			});

			it('should return ForbiddenError: Property', async () => {
				const user = generateUserData() as User;
				settings.userSettings.permission.excluded =['city'];
				
				const rep = getMockRepository(
					{method: 'getOneOrFail', value: user}, 
					{method: 'save', value: user});

				const controller = new Controller(settings, User);
				const result = controller.updateSome(user, user.id);

				await expect(result).rejects.toThrow(PatchPropertyAllowedError);
				expect(rep).toHaveBeenCalled();
			});

			it('should return BADREQUEST: ID ', async () => {
				const user = generateUserData() as User;
				
				const rep = getMockRepository(
					{method: 'getOneOrFail', value: user}, 
					{method: 'save', value: user});

				const controller = new Controller(settings, User);
				const result = controller.updateSome(user, randomUUID());

				await expect(result).rejects.toThrow(IdReplacementError);
				expect(rep).toHaveBeenCalled();
			});

			it('should update user', async () => {
				const oUser = generateUserData() as User;
				const body = {
					id: oUser.id,
					city: 'test city'
				};
				const nUser = {...oUser, ...body};
				
				const rep = getMockRepository(
					{method: 'getOneOrFail', value: oUser}, 
					{method: 'save', value: nUser});

				const controller = new Controller(settings, User);

				const result = await controller.updateSome(body, oUser.id);

				expect(result).toEqual(nUser);
				expect(rep).toHaveBeenCalled();
			});

			it('should throw TypeORMError on save', async () => {
				const user = generateUserData() as User;
				
				const rep = getMockRepository(
					{method: 'getOneOrFail', value: user}, 
					{method: 'save', value: new TypeORMError('Some TypeORMError'), rejected: true});

				const controller = new Controller(settings, User);
				const result = controller.updateSome(user, user.id);

				await expect(result).rejects.toThrow('Some TypeORMError');
			});

		});

		describe('delete', () => {
			let rep: jest.SpyInstance;
			const user = generateUserData() as User;

			beforeEach(() => {
				rep = getMockRepository({
					method: 'getOneOrFail', value: user
				});
				
			});

			it('should return EntityNotFoundError', async () => {
				const rep = getMockRepository({
					method: 'getOneOrFail', value: new EntityNotFoundError(User, `id: ${user.id}`), rejected: true
				});
				
				const controller = new Controller(settings, User);
				const result = controller.delete(user.id);
				
				await expect(result).rejects.toThrow(EntityNotFoundError);
				expect(rep).toHaveBeenCalled();
			});

			it('should return ForbiddenError: Owner', async () => {
				settings.userSettings.permission.ownershipRequired = true;

				const controller = new Controller(settings, User);
				
				const result = controller.delete(user.id);
				await expect(result).rejects.toThrow(NotOwnerError);
				expect(rep).toHaveBeenCalled();
			});

			it('should remove user', async () => {
				const controller = new Controller(settings, User);
				const result = await controller.delete(user.id);

				expect(result).toEqual(user);
				expect(rep).toHaveBeenCalled();
			});

			it('should soft-remove user', async () => {
				const rep = getMockRepository({
					method: 'getOneOrFail', value: user
				});

				const controller = new Controller(settings, User);
				const result = await controller.delete(user.id, true);

				expect(result).toEqual(user);
				expect(rep).toHaveBeenCalled();
			});

			it('should throw TypeORMError on save', async () => {
				const rep = getMockRepository({
					method: 'getOneOrFail', value: new TypeORMError('Some TypeORMError'), rejected: true
				});
				
				const controller = new Controller(settings, User);
				const result = controller.delete(user.id, true);

				await expect(result).rejects.toThrow('Some TypeORMError');

				expect(rep).toHaveBeenCalled();
			});
		});
	});

});