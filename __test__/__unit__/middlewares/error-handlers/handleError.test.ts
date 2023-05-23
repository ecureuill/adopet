import { NextFunction, Request, Response } from 'express';
import { handleError } from '../../../../src/middlewares/error-handlers/handlerError';
import { getMockRequest, getMockResponse } from '../../../utils/mocks';
import NotImplementedError from '../../../../src/utils/errors/NotImplementedError';
import { HTTP_RESPONSE } from '../../../../src/utils/consts';
import createHttpError from 'http-errors';

describe('Error handler middleware', () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	const nextFunction: NextFunction = jest.fn();

	beforeEach(() => {
		mockRequest = getMockRequest();
		mockResponse = getMockResponse();
	});

	it('handle HttpError', async () => {
		const error = new createHttpError.BadGateway('teste');
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

		expect(mockResponse.status).toHaveBeenCalledWith(502);
		expect(mockResponse.json).toHaveBeenCalledWith(err);
		expect(nextFunction).not.toHaveBeenCalled();
	});

	it('handle Node Error without message and number status', async () => {
		const error = new Error();

		const err = {
			message: 'Something went wrong!',
			error_name: error.name,
			error_msg: error.message,
		};

		handleError(
			error,
			mockRequest as Request,
			mockResponse as Response,
			nextFunction
		);

		expect(mockResponse.status).toHaveBeenCalledWith(HTTP_RESPONSE.InternalServerError);
		expect(mockResponse.json).toHaveBeenCalledWith(err);
		expect(nextFunction).not.toHaveBeenCalled();
	});

	it('handle NotImplementedError', async () => {
		const error = new NotImplementedError();

		const err = {
			message: 'Not implemented!',
			error_name: 'NotImplementedError',
			error_msg: 'Not implemented!',
		};

		handleError(
			error,
			mockRequest as Request,
			mockResponse as Response,
			nextFunction
		);

		expect(mockResponse.status).toHaveBeenCalledWith(HTTP_RESPONSE.InternalServerError);
		expect(mockResponse.json).toHaveBeenCalledWith(err);
		expect(nextFunction).not.toHaveBeenCalled();
	});
});