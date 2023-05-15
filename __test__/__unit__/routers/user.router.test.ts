import { Request, Response } from 'express';
import UserController from '../../../src/controller/user.controller';
import UserRouter from '../../../src/routers/user.router';
import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { User } from '../../../src/entities/User';
import { generateUserData, generateUsersData } from '../../utils/generate';
import { getMockResponse } from '../../utils/mocks';

describe('User router', () => {
	let controller: jest.SpyInstance;
	let mockResponse: Partial<Response>;
	let mockRequest: Partial<Request>;

	beforeEach(() => {
		mockRequest = {};
		mockResponse = getMockResponse();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('auth', () => {

		afterEach(() => {
			controller.mockRestore();
		});

		it('should call with OK and result on auth', async () => {

			const result = faker.random.alphaNumeric();

			controller = jest.spyOn(UserController.prototype, 'auth').mockResolvedValueOnce(result);

			mockRequest.body = {
				email: faker.internet.email(),
				password: faker.internet.password()
			};

			const router = new UserRouter();
			const res = await router.auth(mockRequest as Request, mockResponse as Response);

			expect(controller).toHaveBeenCalledTimes(1);
			expect(controller).toHaveBeenCalledWith(mockRequest.body);
			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(200);
		});

		it('should call with OK and result on create', async () => {

			const request = {
				name: faker.name.fullName(),
				email: faker.internet.email(),
				password: faker.internet.password()
			};

			const result = {
				id: randomUUID(),
				...request
			};

			controller = jest.spyOn(UserController.prototype, 'create').mockResolvedValueOnce(result as User);
			mockRequest.body = request;

			const router = new UserRouter();
			const res = await router.create(mockRequest as Request, mockResponse as Response);

			expect(controller).toHaveBeenCalledTimes(1);
			expect(controller).toHaveBeenCalledWith(request);
			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(201);
		});
	});

	describe('getAll', () => {
		afterEach(() => {
			controller.mockRestore();
		});

		it('should call with BADREQUEST when result=[] on getall', async () => {
			const result = {
				entities: [],
				count: 0
			};

			controller = jest.spyOn(UserController.prototype, 'getAll').mockResolvedValueOnce(result);
			
			const router = new UserRouter();
			const res = await router.getAll(mockRequest as Request, mockResponse as Response);

			expect(controller).toHaveBeenCalledTimes(1);
			expect(res.json).toHaveBeenCalledWith({mensagem: 'Não encontrado'});
			expect(res.status).toHaveBeenCalledWith(404);
		});

		it('should call with OK and list entities on getall', async () => {
			const result = {
				entities: generateUsersData() as User[],
				count: 1
			};

			controller = jest.spyOn(UserController.prototype, 'getAll').mockResolvedValueOnce(result);

			const router = new UserRouter();
			const res = await router.getAll(mockRequest as Request, mockResponse as Response);

			expect(controller).toHaveBeenCalledTimes(1);
			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(200);
		});
	});

	describe('getOneById', () => {
		afterEach(() => {
			controller.mockRestore();
		});

		it('should call with OK on getOneById', async () => {
			const result = generateUserData();

			controller = jest.spyOn(UserController.prototype, 'getOneById').mockResolvedValueOnce(result as User);
			mockRequest.params = {id: randomUUID()};

			const router = new UserRouter();
			const res = await router.getOneById(mockRequest as Request, mockResponse as Response);

			expect(controller).toHaveBeenCalledTimes(1);
			expect(controller).toHaveBeenCalledWith(mockRequest.params.id);
			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(200);
		});
	});

	describe('updateAll', () => {
		afterEach(() => {
			controller.mockRestore();
		});

		it('should call with OK on updateAll', async () => {
			const result = generateUserData();

			controller = jest.spyOn(UserController.prototype, 'updateAll').mockResolvedValueOnce(result as User);

			mockRequest.params = {id: randomUUID()};

			mockRequest.body = result;

			const router = new UserRouter();
			const res = await router.updateAll(mockRequest as Request, mockResponse as Response);

			expect(controller).toHaveBeenCalledTimes(1);
			expect(controller).toHaveBeenCalledWith(mockRequest.body, mockRequest.params.id);
			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(200);
		});
	});

	describe('updateSome', () => {
		afterEach(() => {
			controller.mockRestore();
		});

		it('should call with OK on updateSome', async () => {
			const result = generateUserData();

			controller = jest.spyOn(UserController.prototype, 'updateSome').mockResolvedValueOnce(result as User);

			mockRequest.params = {id: randomUUID()};

			mockRequest.body = {
				email: faker.internet.email(),
				password: faker.internet.password()
			};

			const router = new UserRouter();
			const res = await router.updateSome(mockRequest as Request, mockResponse as Response);

			expect(controller).toHaveBeenCalledTimes(1);
			expect(controller).toHaveBeenCalledWith(mockRequest.body, mockRequest.params.id);
			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(200);
		});
	});

	describe('delete', () => {
		afterEach(() => {
			controller.mockRestore();
		});

		it('should call with OK on delete', async () => {
			const result = generateUserData();

			controller = jest.spyOn(UserController.prototype, 'delete').mockResolvedValueOnce(result as User);

			mockRequest.params = {id: randomUUID()};

			const router = new UserRouter();
			const res = await router.delete(mockRequest as Request, mockResponse as Response);

			expect(controller).toHaveBeenCalledTimes(1);
			expect(controller).toHaveBeenCalledWith(mockRequest.params.id);
			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(200);
		});
	});
});