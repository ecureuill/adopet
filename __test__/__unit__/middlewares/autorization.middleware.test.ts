import { NextFunction, Request, Response } from 'express';
import validatePermissions from '../../../src/middlewares/authorization-middleware';
import { Actions, Resources } from '../../../src/utils/consts';
import { randomUUID } from 'crypto';
import { getMockResponse } from '../../utils/mocks';

describe('Authorization middleware', () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let nextFunction: NextFunction;

	beforeEach(() => {
		mockRequest = {};
		mockResponse = getMockResponse();
		mockResponse.locals = {
			user: {
				id: randomUUID(),
				authenticated: true,
				role: 'tutor'
			}
		};
		nextFunction = jest.fn();
	});

	it('Authorize', async () =>{

		expect(() => validatePermissions(
			Resources.PET,
			Actions.READ
		)(mockRequest as Request, mockResponse as Response, nextFunction)).not.toThrow();

		expect(mockResponse.locals?.user.permission).not.toBeUndefined();
		expect(nextFunction).toHaveBeenCalled();
	});

	it('Do not authorize', async () =>{
		
		expect(() => validatePermissions(
			Resources.PET,
			Actions.UPDATE
		)(mockRequest as Request, mockResponse as Response, nextFunction)).toThrow('This action is not authorized');

		expect(mockResponse.locals?.user.permission).toBeUndefined();
		expect(nextFunction).not.toHaveBeenCalled();
	});
});