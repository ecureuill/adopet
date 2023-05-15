import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import PetController from '../../../src/controller/pet.controller';
import PetRouter from '../../../src/routers/pet.router';
import { generatePetData, generatePetsData } from '../../utils/generate';
import { getMockResponse } from '../../utils/mocks';

let mockRequest: Partial<Request>;
let mockResponse: Partial<Response>;

describe('Pet Router', () => {
	let controller: any;

	describe('getAll', () => {

		afterEach(() => {
			jest.restoreAllMocks();
		});

		beforeEach(() => {
			controller = jest.spyOn(PetController.prototype, 'getAll');

			mockRequest = {};
			mockResponse = getMockResponse();
			mockResponse.locals = {
				user: {
					id: randomUUID(),
					authenticated: true,
					role: 'shelter',
					permission: {
						granted: true,
						excluded: undefined,
						included: ['*'],
						ownershipRequired: false
					}
				}
			};
		});

		it('should return 404 - Não encontrado', async () => {
			controller.mockResolvedValueOnce({
				count: 0,
				entities: []
			});

			const router = new PetRouter();
			const res = await router.getAll(mockRequest as Request, mockResponse as Response);

			expect(res.json).toHaveBeenCalledWith({mensagem: 'Não encontrado'});
			expect(res.status).toHaveBeenCalledWith(404);
			expect(controller).toHaveBeenCalledWith();
			expect(controller).toHaveBeenCalledTimes(1);
		});

		it('should return 200', async () => {

			const result = {
				count: 3,
				entities: generatePetsData(3)
			};

			controller.mockResolvedValueOnce(result);

			const router = new PetRouter();
			const res = await router.getAll(mockRequest as Request, mockResponse as Response);

			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(controller).toHaveBeenCalledWith();
			expect(controller).toHaveBeenCalledTimes(1);
		});
	});
	
	describe('getOneById', () => {

		afterEach(() => {
			jest.restoreAllMocks();
		});

		beforeEach(() => {
			controller = jest.spyOn(PetController.prototype, 'getOneById');

			mockRequest = {
				params:{
					id: randomUUID()
				}
			};
			mockResponse = getMockResponse();
			mockResponse.locals = {
				user: {
					id: randomUUID(),
					authenticated: true,
					role: 'shelter',
					permission: {
						granted: true,
						excluded: undefined,
						included: ['*'],
						ownershipRequired: false
					}
				}
			};
		});

		it('should return pet with status 200', async () => {

			const result = generatePetData({id: mockRequest.params!.id});

			controller.mockResolvedValueOnce(result);

			const router = new PetRouter();
			const res = await router.getOneById(mockRequest as Request, mockResponse as Response);

			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(controller).toHaveBeenCalledWith(mockRequest.params!.id);
			expect(controller).toHaveBeenCalledTimes(1);
		});
	});
	
	describe('create', () => {

		afterEach(() => {
			jest.restoreAllMocks();
		});

		beforeEach(() => {
			controller = jest.spyOn(PetController.prototype, 'create');

			mockRequest = {};
			mockResponse = getMockResponse();
			mockResponse.locals = {
				user: {
					id: randomUUID(),
					authenticated: true,
					role: 'shelter',
					permission: {
						granted: true,
						excluded: undefined,
						included: ['*'],
						ownershipRequired: false
					}
				}
			};
		});

		it('should return 201', async () => {
			const result = generatePetData();
			const { id, delete_date,...payload} = result;
			mockRequest.body = payload;

			controller.mockResolvedValueOnce(result);

			const router = new PetRouter();
			const res = await router.create(mockRequest as Request, mockResponse as Response);

			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(201);
			expect(controller).toHaveBeenCalledWith(mockRequest.body);
			expect(controller).toHaveBeenCalledTimes(1);
		});
	});
	
	describe('updateAll', () => {

		afterEach(() => {
			jest.restoreAllMocks();
		});

		beforeEach(() => {
			controller = jest.spyOn(PetController.prototype, 'updateAll');

			mockRequest = {
				params: {},
				body: {}
			};
			mockResponse = getMockResponse();
			mockResponse.locals = {
				user: {
					id: randomUUID(),
					authenticated: true,
					role: 'shelter',
					permission: {
						granted: true,
						excluded: undefined,
						included: ['*'],
						ownershipRequired: false
					}
				}
			};
		});

		it('should return 201', async () => {
			const result = generatePetData();
			const { id, delete_date,...payload} = result;
			mockRequest.body = payload;
			mockRequest.params = {id: id};

			controller.mockResolvedValueOnce(result);

			const router = new PetRouter();
			const res = await router.updateAll(mockRequest as Request, mockResponse as Response);

			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(controller).toHaveBeenCalledWith(mockRequest.body, id);
			expect(controller).toHaveBeenCalledTimes(1);
		});
	});
	
	describe('updateSome', () => {

		afterEach(() => {
			jest.restoreAllMocks();
		});

		beforeEach(() => {
			controller = jest.spyOn(PetController.prototype, 'updateSome');

			mockRequest = {
				params: {},
				body: {}
			};
			mockResponse = getMockResponse();
			mockResponse.locals = {
				user: {
					id: randomUUID(),
					authenticated: true,
					role: 'shelter',
					permission: {
						granted: true,
						excluded: undefined,
						included: ['*'],
						ownershipRequired: false
					}
				}
			};
		});

		it('should return 201', async () => {
			const result = generatePetData();
			const { id, delete_date,...payload} = result;
			mockRequest.body = payload;
			mockRequest.params = {id: id};

			controller.mockResolvedValueOnce(result);

			const router = new PetRouter();
			const res = await router.updateSome(mockRequest as Request, mockResponse as Response);

			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(controller).toHaveBeenCalledWith(mockRequest.body, id);
			expect(controller).toHaveBeenCalledTimes(1);
		});
	});
	describe('getOneById', () => {

		afterEach(() => {
			jest.restoreAllMocks();
		});

		beforeEach(() => {
			controller = jest.spyOn(PetController.prototype, 'delete');

			mockRequest = {
				params:{
					id: randomUUID()
				}
			};
			mockResponse = getMockResponse();
			mockResponse.locals = {
				user: {
					id: randomUUID(),
					authenticated: true,
					role: 'shelter',
					permission: {
						granted: true,
						excluded: undefined,
						included: ['*'],
						ownershipRequired: false
					}
				}
			};
		});

		it('should return pet with status 200', async () => {

			const result = generatePetData({id: mockRequest.params!.id});

			controller.mockResolvedValueOnce(result);

			const router = new PetRouter();
			const res = await router.delete(mockRequest as Request, mockResponse as Response);

			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(controller).toHaveBeenCalledWith(mockRequest.params!.id);
			expect(controller).toHaveBeenCalledTimes(1);
		});
	});
});