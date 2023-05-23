import Ajv, {ErrorObject, AnySchema} from 'ajv';
import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
import { Variant } from '../utils';
import addFormats from 'ajv-formats';
import { MisconfiguredSchemaError } from '../utils/errors/code.errors';
import JSONSchemaValidatorError from '../utils/errors/JSONSchemaValidatorError';

type SchemaValidatorProperties = {
	schema: string,
	data: 'body' | 'params' | 'query',
	strictRequiredChecks?: boolean,
}	

export default class SchemaValidator {
	ajv: Ajv; 

	constructor(schemas: AnySchema[]){
		this.ajv = new Ajv({schemas: schemas, allErrors: true,
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			keywords:[require('ajv-keywords/dist/definitions/transform')()]});
		addFormats(this.ajv);
	}

	validate({schema, data, strictRequiredChecks}: SchemaValidatorProperties){

		if(strictRequiredChecks === undefined)
			strictRequiredChecks = true;

		const validateAjv = this.ajv.getSchema(schema);

		if(validateAjv === undefined){
			throw new MisconfiguredSchemaError(schema);
		}

		return (request: Request, response: Response, next: NextFunction) => {
			const validation = validateAjv((request as unknown as Variant)[data]);

			if(!validation){

				let errors = validateAjv.errors as ErrorObject[];

				if(!strictRequiredChecks)
				{
					errors = errors.filter(err => err.keyword !== 'required');

					if(errors.length === 0) 
						return next();
				}

				throw new JSONSchemaValidatorError(errors, data);
			}
			
			return next();
		};
	}
}