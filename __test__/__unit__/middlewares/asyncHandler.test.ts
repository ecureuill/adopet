import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../../../src/middlewares/asyncHandler';
import { getMockRequest, getMockResponse } from '../../utils/mocks';

describe('asyncHandler middleware', () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let nextFunction: NextFunction;

	beforeEach(() => {
		mockRequest = getMockRequest();
		mockResponse = getMockResponse();
		nextFunction = jest.fn();

	});

	it('should call next with the error when an async function passed into it throws', async () => {
		const rejectError = new Error('Rejected!');
		const fn = async (request: Request, response: Response, next: NextFunction) => Promise.reject(rejectError);

		const middleware = asyncHandler(fn);

		await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

		expect(nextFunction).toHaveBeenCalledWith(rejectError);
	});

	it('should call next with the arguments when an async function passed into it calls next', async () => {
		const fn = async (request: Request, response: Response, next: NextFunction) => {
			next('test');
		};

		const middleware = asyncHandler(fn);

		await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

		expect(nextFunction).toHaveBeenCalledWith('test');
	});

	it('should provide additional arguments to the middleware', async () => {
		const id = 1;

		const fn = async (request: Request, response: Response, next: NextFunction) => {
			return id;
		};

		const middleware = asyncHandler(fn);

		const result = await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

		expect(result).toBe(id);
	});
});