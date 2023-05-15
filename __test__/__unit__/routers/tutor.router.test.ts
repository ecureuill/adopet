import { randomUUID } from 'crypto';
import TutorController from '../../../src/controller/tutor.controller';
import TutorRouter from '../../../src/routers/tutor.router';
import { Request, Response } from 'express';
import { generateTutorData, generateTutorsData } from '../../utils/generate';
import { Tutor } from '../../../src/entities/Tutor';
import { getMockResponse } from '../../utils/mocks';

let mockRequest: Partial<Request>;
let mockResponse: Partial<Response>;

describe('Tutor Router', () => {
	let controller: any;

	beforeEach(() => {
		mockRequest = {};
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
			controller = jest.spyOn(TutorController.prototype, 'getAll')
		});

		it('should return 404 - Não encontrado', async () => {
			controller.mockResolvedValueOnce({
				count: 0,
				entities: []
			});

			const router = new TutorRouter();
			const res = await router.getAll(mockRequest as Request, mockResponse as Response);

			expect(res.json).toHaveBeenCalledWith({mensagem: 'Não encontrado'});
			expect(res.status).toHaveBeenCalledWith(404);
			expect(controller).toHaveBeenCalledWith();
			expect(controller).toHaveBeenCalledTimes(1);
		});

		it('should return 200', async () => {

			const result = {
				count: 3,
				entities: generateTutorsData(3) as Tutor[]
			};
			controller.mockResolvedValueOnce(result);

			const router = new TutorRouter();
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
			controller = jest.spyOn(TutorController.prototype, 'getOneById');
		});

		it('should return tutor with status 200', async () => {

			mockRequest.params = {id: randomUUID()};
			
			const result = generateTutorData({id: mockRequest.params!.id});

			controller.mockResolvedValueOnce(result);

			const router = new TutorRouter();
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
			controller = jest.spyOn(TutorController.prototype, 'create');
		});

		it('should return 201', async () => {
			const result = generateTutorData();
			const { id, delete_date,...payload} = result;
			mockRequest.body = payload;

			controller.mockResolvedValueOnce(result);

			const router = new TutorRouter();
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
			controller = jest.spyOn(TutorController.prototype, 'updateAll');
		});

		it('should return 201', async () => {
			const result = generateTutorData();
			const { id, delete_date,...payload} = result;
			mockRequest.body = payload;
			mockRequest.params = {id: id};

			controller.mockResolvedValueOnce(result);

			const router = new TutorRouter();
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
			controller = jest.spyOn(TutorController.prototype, 'updateSome');
		});

		it('should return 201', async () => {
			const result = generateTutorData();
			const { id, delete_date,...payload} = result;
			mockRequest.body = payload;
			mockRequest.params = {id: id};

			controller.mockResolvedValueOnce(result);

			const router = new TutorRouter();
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
			controller = jest.spyOn(TutorController.prototype, 'delete');
		});

		it('should delete tutor with status 200', async () => {
			mockRequest.params = {id: randomUUID()};

			const result = generateTutorData({id: mockRequest.params!.id});

			controller.mockResolvedValueOnce(result);

			const router = new TutorRouter();
			const res = await router.delete(mockRequest as Request, mockResponse as Response);

			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(controller).toHaveBeenCalledWith(mockRequest.params!.id);
			expect(controller).toHaveBeenCalledTimes(1);
		});
	});
});