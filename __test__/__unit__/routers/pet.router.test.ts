import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import PetController from '../../../src/controller/pet.controller';
import PetRouter from '../../../src/routers/pet.router';
import { generatePetData, generatePetsData } from '../../utils/generate';
import { getMockRequest, getMockResponse } from '../../utils/mocks';
import { HTTP_RESPONSE } from '../../utils/consts';

let mockRequest: Partial<Request>;
let mockResponse: Partial<Response>;

describe('Pet Router', () => {
	let controller: any;

	beforeEach(() => {
		mockRequest = getMockRequest();
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

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('getAll', () => {

		beforeEach(() => {
			controller = jest.spyOn(PetController.prototype, 'getAll');
		});

		it('should return OK - Não encontrado', async () => {
			controller.mockResolvedValueOnce({
				count: 0,
				entities: []
			});

			const router = new PetRouter();
			const res = await router.getAll(mockRequest as Request, mockResponse as Response);

			expect(res.json).toHaveBeenCalledWith({mensagem: 'Não encontrado'});
			expect(res.status).toHaveBeenCalledWith(HTTP_RESPONSE.OK);
			expect(controller).toHaveBeenCalledWith();
			expect(controller).toHaveBeenCalledTimes(1);
		});

		it('should return OK', async () => {

			const result = {
				count: 3,
				entities: generatePetsData(3)
			};

			controller.mockResolvedValueOnce(result);

			const router = new PetRouter();
			const res = await router.getAll(mockRequest as Request, mockResponse as Response);

			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(HTTP_RESPONSE.OK);
			expect(controller).toHaveBeenCalledWith();
			expect(controller).toHaveBeenCalledTimes(1);
		});
	});
	
	describe('getOneById', () => {

		beforeEach(() => {
			controller = jest.spyOn(PetController.prototype, 'getOneById');

			mockRequest.params = {
				id: randomUUID()
			};
		});

		it('should return pet with status OK', async () => {

			const result = generatePetData({id: mockRequest.params?.id});

			controller.mockResolvedValueOnce(result);

			const router = new PetRouter();
			const res = await router.getOneById(mockRequest as Request, mockResponse as Response);

			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(HTTP_RESPONSE.OK);
			expect(controller).toHaveBeenCalledWith(mockRequest.params?.id);
			expect(controller).toHaveBeenCalledTimes(1);
		});
	});
	
	describe('create', () => {

		beforeEach(() => {
			controller = jest.spyOn(PetController.prototype, 'create');
		});

		it('should return CREATED', async () => {
			const result = generatePetData();
			const { id, delete_date,...payload} = result;
			mockRequest.body = payload;

			controller.mockResolvedValueOnce(result);

			const router = new PetRouter();
			const res = await router.create(mockRequest as Request, mockResponse as Response);

			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(HTTP_RESPONSE.Created);
			expect(controller).toHaveBeenCalledWith(mockRequest.body);
			expect(controller).toHaveBeenCalledTimes(1);
		});
	});
	
	describe('updateAll', () => {
		beforeEach(() => {
			controller = jest.spyOn(PetController.prototype, 'updateAll');
		});

		it('should return OK', async () => {
			const result = generatePetData();
			const { id, delete_date,...payload} = result;
			mockRequest.body = payload;
			mockRequest.params = {id: id};

			controller.mockResolvedValueOnce(result);

			const router = new PetRouter();
			const res = await router.updateAll(mockRequest as Request, mockResponse as Response);

			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(HTTP_RESPONSE.OK);
			expect(controller).toHaveBeenCalledWith(mockRequest.body, id);
			expect(controller).toHaveBeenCalledTimes(1);
		});
	});
	
	describe('updateSome', () => {
		beforeEach(() => {
			controller = jest.spyOn(PetController.prototype, 'updateSome');
		});

		it('should return OK', async () => {
			const result = generatePetData();
			const { id, delete_date,...payload} = result;
			mockRequest.body = payload;
			mockRequest.params = {id: id};

			controller.mockResolvedValueOnce(result);

			const router = new PetRouter();
			const res = await router.updateSome(mockRequest as Request, mockResponse as Response);

			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(HTTP_RESPONSE.OK);
			expect(controller).toHaveBeenCalledWith(mockRequest.body, id);
			expect(controller).toHaveBeenCalledTimes(1);
		});
	});
	describe('getOneById', () => {
		beforeEach(() => {
			controller = jest.spyOn(PetController.prototype, 'delete');
		});

		it('should return OK with pet', async () => {

			const result = generatePetData({id: mockRequest.params?.id});

			controller.mockResolvedValueOnce(result);

			const router = new PetRouter();
			const res = await router.delete(mockRequest as Request, mockResponse as Response);

			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(HTTP_RESPONSE.OK);
			expect(controller).toHaveBeenCalledWith(mockRequest.params?.id);
			expect(controller).toHaveBeenCalledTimes(1);
		});
	});
});