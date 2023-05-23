import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { handleError } from '../../../../src/middlewares/error-handlers/handlerError';
import { HTTP_RESPONSE } from '../../../../src/utils/consts';
import BaseError from '../../../../src/utils/errors/BaseError';
import { MethodNotAllowedError, PatchPropertyAllowedError, BadRequestError, ForbiddenError } from '../../../../src/utils/errors/http.errors';
import {NotOwnerError, IdReplacementError, SignUPEmailError, SignInLoginError} from '../../../../src/utils/errors/business.errors';
import { MisconfiguredError, MisconfiguredSchemaError, NotImplementedError } from '../../../../src/utils/errors/code.errors';
import { getMockRequest, getMockResponse } from '../../../utils/mocks';

describe('Error handler middleware', () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	const nextFunction: NextFunction = jest.fn();

	beforeEach(() => {
		mockRequest = getMockRequest();
		mockResponse = getMockResponse();
	});

	it('handle Http-Error', async () => {
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
	
	it('handle Http-Error extendend error', async () => {
		const error = new PatchPropertyAllowedError();

		const err = {
			message: 'Property update is not authorized',
			error_name: 'PatchPropertyAllowedError',
			error_msg: 'Property update is not authorized',
			error_header: undefined
		};

		handleError(
			error,
			mockRequest as Request,
			mockResponse as Response,
			nextFunction
		);

		expect(mockResponse.status).toHaveBeenCalledWith(HTTP_RESPONSE.Forbidden);
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

	it('handle BaseError', async () => {
		const error = new BaseError('base error');

		const err = {
			message: 'base error',
			error_name: 'BaseError',
			error_msg: 'base error',
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