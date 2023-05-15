import { randomUUID } from 'crypto';
import { Role } from '../../../src/types/enums';
import { JWTVerify } from '../../../src/middlewares/jwt-middleware';
import { NextFunction, Request, Response } from 'express';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { generateToken } from '../../utils/generate';
import { getMockResponse } from '../../utils/mocks';

describe('JWTVerify middleware', () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let nextFunction: NextFunction;

	beforeEach(() => {
		mockRequest = {};
		mockResponse = getMockResponse();
		nextFunction = jest.fn();
	});

	it('Without headers', async () =>{

		JWTVerify(mockRequest as Request, mockResponse as Response, nextFunction);
		expect(nextFunction).toHaveBeenCalledTimes(1);
		expect(mockResponse.locals?.user).toMatchObject({
			id: '',
			authenticated: false,
			role: 'ANY',
			permission: {
				granted: false,
				excluded: undefined,
				included: undefined,
			}
		});
	});

	it('Without authorization header', async () =>{
		mockRequest = {
			headers: {
			}
		};

		JWTVerify(mockRequest as Request, mockResponse as Response, nextFunction);
		expect(nextFunction).toHaveBeenCalledTimes(1);
		expect(mockResponse.locals?.user).toMatchObject({
			id: '',
			authenticated: false,
			role: 'ANY',
			permission: {
				granted: false,
				excluded: undefined,
				included: undefined,
			}
		});
	});

	it('with malformed authorization header', async () =>{
		
		mockRequest = {
			headers: {
				authorization: `Bearer ${faker.random.alphaNumeric()}` 
			}
		};

		expect(() => JWTVerify(mockRequest as Request, mockResponse as Response, nextFunction)).toThrow('jwt malformed');
		expect(nextFunction).not.toBeCalled();
	});

	it('with authorization header', async () =>{
		const id = randomUUID();
		mockRequest = {
			headers: {
				authorization: `Bearer ${(generateToken({id: id, role: Role.ADMIN}))}`
			}
		};

		JWTVerify(mockRequest as Request, mockResponse as Response, nextFunction);

		expect(mockResponse.locals!.user).not.toBeUndefined();
		expect(mockResponse.locals!.user).toMatchObject({
			id: id,
			authenticated: true,
			role: Role.ADMIN
		});
		expect(nextFunction).toHaveBeenCalledTimes(1);
	});
});