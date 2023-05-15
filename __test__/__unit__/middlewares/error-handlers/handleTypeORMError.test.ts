import { NextFunction, Request, Response } from 'express';
import { handleTypeORMError } from '../../../../src/middlewares/error-handlers/handleTypeORMError';
import { EntityNotFoundError, QueryFailedError, TypeORMError } from 'typeorm';
import { HttpError } from 'http-errors';
import { getMockResponse } from '../../../utils/mocks';

describe('TypeORM Error handler middleware', () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	const nextFunction: NextFunction = jest.fn();

	beforeEach(() => {
		mockRequest = {};
		mockResponse = getMockResponse();
	});

	it('handle EntityNotFoundError', async () => {
		const error = new EntityNotFoundError('name', 'd=1');
		const err = {
			error_name: error.name,
			error_msg: error.message,
			message: 'Não encontrado'
		};

		handleTypeORMError(
			error as unknown as HttpError,
			mockRequest as Request,
			mockResponse as Response,
			nextFunction
		);
		

		expect(mockResponse.status).toHaveBeenCalledWith(404);
		expect(mockResponse.json).toHaveBeenCalledWith(err);
		expect(nextFunction).not.toHaveBeenCalledTimes(1);
	});

	it('handle QueryFailedError', async () => {
		const error = new QueryFailedError('selec * from users',undefined, {});
		const err = {
			error_name: error.name,
			error_msg: error.message,
			message: error.message
		};

		handleTypeORMError(
			error as unknown as HttpError,
			mockRequest as Request,
			mockResponse as Response,
			nextFunction
		);
		

		expect(mockResponse.status).toHaveBeenCalledWith(400);
		expect(mockResponse.json).toHaveBeenCalledWith(err);
		expect(nextFunction).not.toHaveBeenCalledTimes(1);
	});

	it('handle unexpected TypeORM errors', async () => {
		const error = new TypeORMError('generic typeorm error');
		const err = {
			error_name: `TypeORMErrorGENERIC ${error.name}`,
			error_msg: error.message,
			message: error.message
		};

		handleTypeORMError(
			error as HttpError,
			mockRequest as Request,
			mockResponse as Response,
			nextFunction
		);
		

		expect(mockResponse.status).toHaveBeenCalledWith(501);
		expect(mockResponse.json).toHaveBeenCalledWith(err);
		expect(nextFunction).not.toHaveBeenCalledTimes(1);
	});

	it('do not handle other errors', async () => {
		handleTypeORMError(
			new Error('Not a TypeORM error') as HttpError,
			mockRequest as Request,
			mockResponse as Response,
			nextFunction
		);

		expect(mockResponse.status).not.toHaveBeenCalled();
		expect(mockResponse.json).not.toHaveBeenCalled();
		expect(nextFunction).toHaveBeenCalledTimes(1);
	});
});