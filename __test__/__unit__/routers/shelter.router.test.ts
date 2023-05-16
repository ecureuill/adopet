import { randomUUID } from 'crypto';
import ShelterController from '../../../src/controller/shelter.controller';
import ShelterRouter from '../../../src/routers/shelter.router';
import { Request, Response } from 'express';
import { generateShelterData, generateSheltersData } from '../../utils/generate';
import { Shelter } from '../../../src/entities/Shelter';
import { getMockRequest, getMockResponse } from '../../utils/mocks';

let mockRequest: Partial<Request>;
let mockResponse: Partial<Response>;

describe('Shelter Router', () => {
	let controller: jest.SpyInstance;

	beforeEach(() => {
		mockRequest = getMockRequest();
		mockResponse = getMockResponse();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});


	describe('getAll', () => {

		afterEach(() => {
			controller.mockRestore();
		});

		beforeEach(() => {
			controller = jest.spyOn(ShelterController.prototype, 'getAll');
		});

		it('should return 404 - Não encontrado', async () => {
			controller.mockResolvedValueOnce({
				count: 0,
				entities: []
			});

			const router = new ShelterRouter();
			const res = await router.getAll(mockRequest as Request, mockResponse as Response);

			expect(res.json).toHaveBeenCalledWith({mensagem: 'Não encontrado'});
			expect(res.status).toHaveBeenCalledWith(404);
			expect(controller).toHaveBeenCalledWith();
			expect(controller).toHaveBeenCalledTimes(1);
		});

		it('should return 200', async () => {

			const result = {
				count: 3,
				entities: generateSheltersData(3) as Shelter[]
			};
			controller.mockResolvedValueOnce(result);

			const router = new ShelterRouter();
			const res = await router.getAll(mockRequest as Request, mockResponse as Response);

			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(controller).toHaveBeenCalledWith();
			expect(controller).toHaveBeenCalledTimes(1);
		});
	});
	
	describe('getOneById', () => {

		afterEach(() => {
			controller.mockRestore();
		});

		beforeEach(() => {
			controller = jest.spyOn(ShelterController.prototype, 'getOneById');
		});

		it('should return Shelter with status 200', async () => {

			mockRequest.params = {id: randomUUID()};
			
			const result = generateShelterData({id: mockRequest.params!.id});

			controller.mockResolvedValueOnce(result);

			const router = new ShelterRouter();
			const res = await router.getOneById(mockRequest as Request, mockResponse as Response);

			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(controller).toHaveBeenCalledWith(mockRequest.params!.id);
			expect(controller).toHaveBeenCalledTimes(1);
		});
	});
	
	describe('create', () => {

		afterEach(() => {
			controller.mockRestore();
		});

		beforeEach(() => {
			controller = jest.spyOn(ShelterController.prototype, 'create');
		});

		it('should return 201', async () => {
			const result = generateShelterData();
			const { id, delete_date,...payload} = result;
			mockRequest.body = payload;

			controller.mockResolvedValueOnce(result);

			const router = new ShelterRouter();
			const res = await router.create(mockRequest as Request, mockResponse as Response);

			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(201);
			expect(controller).toHaveBeenCalledWith(mockRequest.body);
			expect(controller).toHaveBeenCalledTimes(1);
		});
	});
	
	describe('updateAll', () => {

		afterEach(() => {
			controller.mockRestore();
		});

		beforeEach(() => {
			controller = jest.spyOn(ShelterController.prototype, 'updateAll');
		});

		it('should return 201', async () => {
			const result = generateShelterData();
			const { id, delete_date,...payload} = result;
			mockRequest.body = payload;
			mockRequest.params = {id: id};

			controller.mockResolvedValueOnce(result);

			const router = new ShelterRouter();
			const res = await router.updateAll(mockRequest as Request, mockResponse as Response);

			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(controller).toHaveBeenCalledWith(mockRequest.body, id);
			expect(controller).toHaveBeenCalledTimes(1);
		});
	});
	
	describe('updateSome', () => {

		afterEach(() => {
			controller.mockRestore();
		});

		beforeEach(() => {
			controller = jest.spyOn(ShelterController.prototype, 'updateSome');
		});

		it('should return 201', async () => {
			const result = generateShelterData();
			const { id, delete_date,...payload} = result;
			mockRequest.body = payload;
			mockRequest.params = {id: id};

			controller.mockResolvedValueOnce(result);

			const router = new ShelterRouter();
			const res = await router.updateSome(mockRequest as Request, mockResponse as Response);

			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(controller).toHaveBeenCalledWith(mockRequest.body, id);
			expect(controller).toHaveBeenCalledTimes(1);
		});
	});
	
	describe('delete', () => {

		afterEach(() => {
			controller.mockRestore();
		});

		beforeEach(() => {
			controller = jest.spyOn(ShelterController.prototype, 'delete');
		});

		it('should delete Shelter with status 200', async () => {
			mockRequest.params = {id: randomUUID()};

			const result = generateShelterData({id: mockRequest.params!.id});

			controller.mockResolvedValueOnce(result);

			const router = new ShelterRouter();
			const res = await router.delete(mockRequest as Request, mockResponse as Response);

			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(controller).toHaveBeenCalledWith(mockRequest.params!.id);
			expect(controller).toHaveBeenCalledTimes(1);
		});
	});
});