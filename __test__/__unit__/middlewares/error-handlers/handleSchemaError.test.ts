import { NextFunction, Request, Response } from 'express';
import {ErrorObject}  from 'ajv';
import { handleSchemaError } from '../../../../src/middlewares/error-handlers/handleSchemaError';
import { getMockRequest, getMockResponse } from '../../../utils/mocks';
import JSONSchemaValidatorError from '../../../../src/utils/errors/JSONSchemaValidatorError';
import { HTTP_RESPONSE } from '../../../../src/utils/consts';

describe('Schema error handler middleware', () => {
	const ajvErros: ErrorObject[] = [
		{
			instancePath: '/instancePath',
			keyword: 'test_err',
			params: [{param: 'value'}],
			schemaPath: '',
			message: 'ajv error'
		}
	];
	const error = new JSONSchemaValidatorError(ajvErros, 'body');

	const err = {
		message: `${ajvErros[0].instancePath} ${ajvErros[0].message}`,
		error_name: `${ajvErros[0].keyword} Schema Error`,
		error_msg: ajvErros[0].message || '',
		params: ajvErros[0].params
	};

	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	const nextFunction: NextFunction = jest.fn();

	beforeEach(() => {
		mockRequest = getMockRequest();
		mockResponse = getMockResponse();
	});

	it('handle JSONSchemaValidatorError errors', async () => {
		handleSchemaError(
			error as JSONSchemaValidatorError,
			mockRequest as Request,
			mockResponse as Response,
			nextFunction
		);
		

		expect(mockResponse.status).toHaveBeenCalledWith(HTTP_RESPONSE.BadRequest);
		expect(mockResponse.json).toHaveBeenCalledWith(err);
		expect(nextFunction).not.toHaveBeenCalled();
	});

	it('do not handle other errors', async () => {
		handleSchemaError(
			new Error('Not a json schema error') as JSONSchemaValidatorError,
			mockRequest as Request,
			mockResponse as Response,
			nextFunction
		);

		expect(mockResponse.status).not.toHaveBeenCalled();
		expect(mockResponse.json).not.toHaveBeenCalled();
		expect(nextFunction).toHaveBeenCalledTimes(1);
	});
});