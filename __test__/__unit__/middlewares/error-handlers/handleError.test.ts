import { NextFunction, Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import { handleError } from '../../../../src/middlewares/error-handlers/handlerError';
import { getMockResponse } from '../../../utils/mocks';

describe('Error handler middleware', () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	const nextFunction: NextFunction = jest.fn();

	beforeEach(() => {
		mockRequest = {};
		mockResponse = getMockResponse();
	});

	it('handle HttpError', async () => {
		const error = new createHttpError[501]('error test');

		const err = {
			message: error.message,
			error_name: error.name,
			error_msg: error.message,
		};

		handleError(
			error,
			mockRequest as Request,
			mockResponse as Response,
			nextFunction
		);

		expect(mockResponse.status).toHaveBeenCalledWith(501);
		expect(mockResponse.json).toHaveBeenCalledWith(err);
		expect(nextFunction).not.toHaveBeenCalled();
	});

	it('handle custom error without message and number status', async () => {
		const error = new Error();

		const err = {
			message: 'Something went wrong!',
			error_name: error.name,
			error_msg: error.message,
		};

		handleError(
			error as HttpError,
			mockRequest as Request,
			mockResponse as Response,
			nextFunction
		);

		expect(mockResponse.status).toHaveBeenCalledWith(500);
		expect(mockResponse.json).toHaveBeenCalledWith(err);
		expect(nextFunction).not.toHaveBeenCalled();
	});
});