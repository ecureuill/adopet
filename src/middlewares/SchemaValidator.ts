import Ajv, {ErrorObject, AnySchema} from 'ajv';
import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
import { Variant } from '../utils';
import { JSONSchemaValidatorError } from '../utils/JSONSchemaValidatorError';
import addFormats from 'ajv-formats';

export default class SchemaValidator {
	ajv: Ajv; 

	constructor(schemas: AnySchema[]){
		this.ajv = new Ajv({schemas: schemas});
		addFormats(this.ajv);
	}

	validate = (schema: string, data: 'body' | 'params' | 'query') => {

		const validateAjv = this.ajv.getSchema(schema);

		if(validateAjv === undefined){
			throw createError(501, { message: 'Schema not founded'});
		}

		return (request: Request, response: Response, next: NextFunction) => {
			const validation = validateAjv((request as unknown as Variant)[data]);

console.debug((request as unknown as Variant)[data]);

			if(!validation)
				throw new JSONSchemaValidatorError(validateAjv.errors as ErrorObject[], data);
			return next();
		};
	};
}