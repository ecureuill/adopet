import { faker } from '@faker-js/faker/locale/pt_BR';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import AdoptionRouter from '../../../src/routers/adoption.router';
import AdoptionController from '../../../src/controller/adoption.controller';
import { generateAdoptionData, generateAdoptionsData } from '../../utils/generate';
import { getMockRequest, getMockResponse } from '../../utils/mocks';
import { Adoption } from '../../../src/entities/Adoption';
import { HTTP_RESPONSE } from '../../../src/utils/consts';


describe('Adoption router', () => {
	let controller: jest.SpyInstance;
	let mockResponse: Partial<Response>;
	let mockRequest: Partial<Request>;

	beforeEach(() => {
		mockRequest = getMockRequest();
		mockResponse = getMockResponse();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('create', () => {

		afterEach(() => {
			controller.mockRestore();
		});

		it('should call with CREATED and result message when post /adocao', async () => {

			const result = generateAdoptionData() as Adoption;

			controller = jest.spyOn(AdoptionController.prototype, 'create').mockResolvedValue(result);

			mockRequest.body = {
				petId: randomUUID(),
				tutorId: randomUUID(),
			};

			const router = new AdoptionRouter();
			const res = await router.create(mockRequest as Request, mockResponse as Response);

			expect(controller).toHaveBeenCalledTimes(1);
			expect(controller).toHaveBeenCalledWith(mockRequest.body);
			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(HTTP_RESPONSE.Created);
		});
	});

	describe('getAll', () => {
		afterEach(() => {
			controller.mockRestore();
		});

		test.each([[true], [false]])('should call with OK and list adoptions on getall', async (includeSensitive) => {
			const result = {
				entities: generateAdoptionsData(1, { adoption: {}, pet: {}, tutor: {} }, includeSensitive) as unknown as Adoption[],
				count: 1
			};

			controller = jest.spyOn(AdoptionController.prototype, 'getAll').mockResolvedValueOnce(result);

			const router = new AdoptionRouter();
			const res = await router.getAll(mockRequest as Request, mockResponse as Response);

			expect(controller).toHaveBeenCalledTimes(1);
			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(HTTP_RESPONSE.OK);
		});
	});

	describe('getOneById', () => {
		afterEach(() => {
			controller.mockRestore();
		});

		it('should call with OK on getOneById', async () => {
			const result = generateAdoptionData();

			controller = jest.spyOn(AdoptionController.prototype, 'getOneById').mockResolvedValue(result as Adoption);
			mockRequest.params = {id: randomUUID()};

			const router = new AdoptionRouter();
			const res = await router.getOneById(mockRequest as Request, mockResponse as Response);

			expect(controller).toHaveBeenCalledTimes(1);
			expect(controller).toHaveBeenCalledWith(mockRequest.params.id);
			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(HTTP_RESPONSE.OK);
		});
	});

	describe('delete', () => {
		afterEach(() => {
			controller.mockRestore();
		});

		it('should call with OK on delete', async () => {
			const result = generateAdoptionData({adoption: {delete_date: faker.date.soon().toISOString()}, pet: { adopted: false }, tutor: {}});

			controller = jest.spyOn(AdoptionController.prototype, 'delete').mockResolvedValueOnce(result as Adoption);

			mockRequest.params = {id: randomUUID()};

			const router = new AdoptionRouter();
			const res = await router.delete(mockRequest as Request, mockResponse as Response);

			expect(controller).toHaveBeenCalledTimes(1);
			expect(controller).toHaveBeenCalledWith(mockRequest.params.id);
			expect(res.json).toHaveBeenCalledWith(result);
			expect(res.status).toHaveBeenCalledWith(HTTP_RESPONSE.OK);
		});
	});
});