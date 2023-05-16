import { randomUUID } from 'crypto';
import SchemaValidator from '../../../src/middlewares/SchemaValidator';
import schemas from '../../../src/services/schemas';
import { SCHEMA_ERRORS_CODE } from '../../utils/consts';
import { NextFunction, Request, Response } from 'express';
import { getMockRequest } from '../../utils/mocks';

const testSchema = {
	$id: 'testSchema',
	type: 'object',
	properties:{
		nonEmptyString:{$ref: 'definitionsSchema#/definitions/non-empty-string'},
		nullableNonEmptyString:{$ref: 'definitionsSchema#/definitions/non-nullable-empty-string'},
		uuid:{$ref: 'definitionsSchema#/definitions/uuid'},
		email:{$ref: 'definitionsSchema#/definitions/email'},
		password:{$ref: 'definitionsSchema#/definitions/password'},
		phone:{$ref: 'definitionsSchema#/definitions/phone'},
		state:{$ref: 'definitionsSchema#/definitions/state'},
		age: {
			type: 'number',
			minimum: 1,
		},
		age_unit: {
			type: 'string',
			enum: ['y', 'm', 'd']
		},
		age_unit2: {$ref: '#/properties/age_unit'},
		age_unit3: {$ref: '#/properties/age_unit'},
		size_variety: {
			type: 'string',
			enum: ['xxs', 'xs', 's', 'm', 'l', 'xl']
		},
		size_variety2: {$ref: '#/properties/size_variety'},
		size_variety3: {$ref: '#/properties/size_variety'},
		size_variety4: {$ref: '#/properties/size_variety'},
		size_variety5: {$ref: '#/properties/size_variety'},
		size_variety6: {$ref: '#/properties/size_variety'},
		type: {
			type: 'string',
			enum: ['dog', 'cat']
		},
		type2: {$ref: '#/properties/type'},
		adopted: {type: 'boolean'},
		adopted2: {$ref: '#/properties/adopted'},
		vector: {
			type: 'array',
			uniqueItems: true,
		}
	},
};

const validator = new SchemaValidator([...schemas, testSchema]);

let mockRequest: Partial<Request>;
let mockResponse: Partial<Response>;
let nextFunction: NextFunction;

describe('schema validation', () => {

	beforeEach(() => {
		mockRequest = getMockRequest();
		mockResponse = {};
		nextFunction = jest.fn();
	});

	describe('definitions schema validation', () => {
		let settings: any;

		beforeEach(() => {
			settings = {schema: 'testSchema', data: 'body',strictRequiredChecks: true};
		});

		it('should throw for request without body', () => {
			mockRequest.body = undefined;
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(SCHEMA_ERRORS_CODE.object);
			expect(nextFunction).not.toBeCalled();
		});

		it('should not throw for non-empty-string when ="a"', () => {
			mockRequest = {
				body:{
					nonEmptyString: 'a'
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).not.toThrow();
			expect(nextFunction).toBeCalledTimes(1);
		});

		it('should throw for non-empty-string=" "', () => {
			mockRequest = {
				body:{
					nonEmptyString: ' '
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/nonEmptyString ${SCHEMA_ERRORS_CODE.minLength}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for non-empty-string=""', () => {
			mockRequest = {
				body:{
					nonEmptyString: ''
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/nonEmptyString ${SCHEMA_ERRORS_CODE.minLength}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should not throw for nullableNonEmptyString=null', () => {
			mockRequest = {
				body:{
					nullableNonEmptyString: null
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).not.toThrow();
			expect(nextFunction).toBeCalledTimes(1);
		});

		it('should throw for nullableNonEmptyString=""', () => {
			mockRequest = {
				body:{
					nullableNonEmptyString: ''
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/nullableNonEmptyString ${SCHEMA_ERRORS_CODE.minLength}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should not throw for uuid=uuid', () => {
			mockRequest = {
				body:{
					uuid: randomUUID()
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).not.toThrow();
			expect(nextFunction).toBeCalledTimes(1);
		});

		it('should throw for uuid=""', () => {
			mockRequest = {
				body:{
					uuid: ''
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/uuid ${SCHEMA_ERRORS_CODE.format}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should not throw for email=email', () => {
			mockRequest = {
				body:{
					email: 'email.23k-ddf@mail.com.cv'
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).not.toThrow();
			expect(nextFunction).toBeCalledTimes(1);
		});

		it('should throw for email=""', () => {
			mockRequest = {
				body:{
					email: 'email.23k-ddf@mail'
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/email ${SCHEMA_ERRORS_CODE.format}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should not throw for phone=11.98729-0291', () => {
			mockRequest = {
				body:{
					phone: '11.98729-0291'
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).not.toThrow();
			expect(nextFunction).toBeCalledTimes(1);
		});

		it('should throw for phone="(11) 98729-0291"', () => {
			mockRequest = {
				body:{
					phone: '(11) 98729-0291'
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/phone ${SCHEMA_ERRORS_CODE.pattern}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should not throw for password=abc@1234', () => {
			mockRequest = {
				body:{
					password: 'abc@1234'
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).not.toThrow();
			expect(nextFunction).toBeCalledTimes(1);
		});

		it('should throw for password="abc"', () => {
			mockRequest = {
				body:{
					password: 'abc'
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/password ${SCHEMA_ERRORS_CODE.minLength}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should not throw for state=AB', () => {
			mockRequest = {
				body:{
					state: 'AB'
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).not.toThrow();
			expect(nextFunction).toBeCalledTimes(1);
		});

		it('should not throw for state=null', () => {
			mockRequest = {
				body:{
					state: null			
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).not.toThrow();
			expect(nextFunction).toBeCalledTimes(1);
		});

		it('should throw for state="a2"', () => {
			mockRequest = {
				body:{
					state: 'a2'
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/state ${SCHEMA_ERRORS_CODE.pattern}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for state="  "', () => {
			mockRequest = {
				body:{
					state: '  '
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/state ${SCHEMA_ERRORS_CODE.minLength}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for state="abc"', () => {
			mockRequest = {
				body:{
					state: 'abc'
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/state ${SCHEMA_ERRORS_CODE.maxLength}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for state=""', () => {
			mockRequest = {
				body:{
					state: ''
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/state ${SCHEMA_ERRORS_CODE.minLength}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should not throw for age=1234', () => {
			mockRequest = {
				body:{
					age: 1234
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).not.toThrow();
			expect(nextFunction).toBeCalledTimes(1);
		});

		it('should throw for age=0', () => {
			mockRequest = {
				body:{
					age: 0
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/age ${SCHEMA_ERRORS_CODE.minimum}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for age=-10', () => {
			mockRequest = {
				body:{
					age: -10
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/age ${SCHEMA_ERRORS_CODE.minimum}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for age="123"', () => {
			mockRequest = {
				body:{
					age: '123'
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/age ${SCHEMA_ERRORS_CODE.number}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should not throw for age_unit="y" age_unit="m" age_unit="d"', () => {
			mockRequest = {
				body:{
					age_unit: 'y',
					age_unit2: 'm',
					age_unit3: 'd',
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).not.toThrow();
			expect(nextFunction).toBeCalledTimes(1);
		});

		it('should throw for age_unit="a2"', () => {
			mockRequest = {
				body:{
					age_unit: 'a2'
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/age_unit ${SCHEMA_ERRORS_CODE.enum}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for age_unit=0', () => {
			mockRequest = {
				body:{
					age_unit: 0
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/age_unit ${SCHEMA_ERRORS_CODE.string}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for age_unit=null', () => {
			mockRequest = {
				body:{
					age_unit: null
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/age_unit ${SCHEMA_ERRORS_CODE.string}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should not throw for size_variety=enums', () => {

			mockRequest = {
				body:{
					size_variety: 'xxs',
					size_variety2: 'xs',
					size_variety3: 's',
					size_variety4: 'm',
					size_variety5: 'l',
					size_variety6: 'xl',
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).not.toThrow();
			expect(nextFunction).toBeCalledTimes(1);
		});

		it('should throw for size_variety="a2"', () => {
			mockRequest = {
				body:{
					size_variety: 'a2'
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/size_variety ${SCHEMA_ERRORS_CODE.enum}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for size_variety=0', () => {
			mockRequest = {
				body:{
					size_variety: 0
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/size_variety ${SCHEMA_ERRORS_CODE.string}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for size_variety=null', () => {
			mockRequest = {
				body:{
					size_variety: null
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/size_variety ${SCHEMA_ERRORS_CODE.string}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should not throw for type=enums', () => {

			mockRequest = {
				body:{
					type: 'dog',
					type2: 'cat',
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).not.toThrow();
			expect(nextFunction).toBeCalledTimes(1);
		});

		it('should throw for type="a2"', () => {
			mockRequest = {
				body:{
					type: 'a2'
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/type ${SCHEMA_ERRORS_CODE.enum}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for type=0', () => {
			mockRequest = {
				body:{
					type: 0
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/type ${SCHEMA_ERRORS_CODE.string}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for type=null', () => {
			mockRequest = {
				body:{
					type: null
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/type ${SCHEMA_ERRORS_CODE.string}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should not throw for adopted=true adopted=false', () => {
			mockRequest = {
				body:{
					adopted: true,
					adopted2: false
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).not.toThrow();
			expect(nextFunction).toBeCalledTimes(1);
		});

		it('should throw for adopted="true"', () => {
			mockRequest = {
				body:{
					adopted: 'true'
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/adopted ${SCHEMA_ERRORS_CODE.boolean}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for adopted=""', () => {
			mockRequest = {
				body:{
					adopted: ''
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/adopted ${SCHEMA_ERRORS_CODE.boolean}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for adopted=null', () => {
			mockRequest = {
				body:{
					adopted: null
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/adopted ${SCHEMA_ERRORS_CODE.boolean}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should not throw for vector=[]', () => {
			mockRequest = {
				body:{
					vector: []
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).not.toThrow();
			expect(nextFunction).toBeCalledTimes(1);
		});

		it('should throw for vector=[0,0,0]', () => {
			mockRequest = {
				body:{
					vector: [0,0,0]
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/vector ${SCHEMA_ERRORS_CODE.uniqueItems}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for vector=[{id: 0, a: 1},{id: 0, a: 1}]', () => {
			mockRequest = {
				body:{
					vector: [{id: 0, a: 1},{id: 0, a: 1}]
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/vector ${SCHEMA_ERRORS_CODE.uniqueItems}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for vector=0', () => {
			mockRequest = {
				body:{
					vector: 0
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/vector ${SCHEMA_ERRORS_CODE.array}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for vector=null', () => {
			mockRequest = {
				body:{
					vector: null
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/vector ${SCHEMA_ERRORS_CODE.array}`);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for vector={}', () => {
			mockRequest = {
				body:{
					vector: {}
				}
			};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(`/vector ${SCHEMA_ERRORS_CODE.array}`);
			expect(nextFunction).not.toBeCalled();
		});
	});

	describe('userSchema validation', () => {
		let settings: any;

		beforeEach(() => {
			settings = {schema: 'userSchema', data: 'body',strictRequiredChecks: true};
		});

		const required = {
			email: 'email@email.com',
			name: 'name',
			password: '12345678'
		};
		
		const optional = {
			id: randomUUID(),
			role: 'admin'
		};

		it('should validate body containing all required properties', () => {
			mockRequest.body = required;

			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).not.toThrow();
			expect(nextFunction).toBeCalledTimes(1);
		});

		it('should validate body without required properties when strictRequiredChecks=false', () => {
			mockRequest.body = optional;
			settings.strictRequiredChecks = false;

			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).not.toThrow();
			expect(nextFunction).toBeCalledTimes(1);
		});

		it('should throw for body={} with strictRequiredChecks=false', () => {
			settings.strictRequiredChecks = false;
			mockRequest.body = {};

			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(SCHEMA_ERRORS_CODE.minProperties);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for body={} with strictRequiredChecks=true', () => {
			settings.strictRequiredChecks = true;
			mockRequest.body = {};

			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(SCHEMA_ERRORS_CODE.minProperties);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for body missing required properties', () => {

			mockRequest.body = optional;
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(SCHEMA_ERRORS_CODE.required);
			
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for body containing additional properties', () => {

			mockRequest.body = {...required, any: 'any'};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(SCHEMA_ERRORS_CODE.additionalProperties);
			
			expect(nextFunction).not.toBeCalled();
		});
	});

	describe('tutorSchema validation', () => {
		let settings: any;

		beforeEach(() => {
			settings = {schema: 'tutorSchema', data: 'body',strictRequiredChecks: true};
		});

		const required = {
			user:{
				email: 'email@email.com',
				name: 'name',
				password: '12345678'
			}
		};
		const optional = {
			id: randomUUID(),
			userId: randomUUID(),
			about: null,
			photo: null,
			delete_date: null,
			user:{
				role: 'admin',
				id: randomUUID(),
			}
		};

		it('should validate body containing all required properties', () => {
			mockRequest.body = required;

			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).not.toThrow();
			expect(nextFunction).toBeCalledTimes(1);
		});

		it('should validate body without required properties when strictRequiredChecks=false', () => {
			mockRequest.body = optional;
			settings.strictRequiredChecks = false;

			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).not.toThrow();
			expect(nextFunction).toBeCalledTimes(1);
		});

		it('should throw for body={} with strictRequiredChecks=false', () => {
			settings.strictRequiredChecks = false;
			mockRequest.body = {};

			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(SCHEMA_ERRORS_CODE.minProperties);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for body={} with strictRequiredChecks=true', () => {
			settings.strictRequiredChecks = true;
			mockRequest.body = {};

			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(SCHEMA_ERRORS_CODE.minProperties);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for body missing required properties', () => {

			mockRequest.body = optional;
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(SCHEMA_ERRORS_CODE.required);
			
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for body containing additional properties', () => {

			mockRequest.body = {...required, any: 'any'};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(SCHEMA_ERRORS_CODE.additionalProperties);
			
			expect(nextFunction).not.toBeCalled();
		});
	});

	describe('petSchema validation', () => {
		let settings: any;

		beforeEach(() => {
			mockRequest = {};

			settings = {schema: 'petSchema', data: 'body',strictRequiredChecks: true};
		});

		const required = { 
			age: 1,
			name: 'petinho',
		};
		const optional = {
			adopted: false,
			age_unit: 'y',
			id: randomUUID(),
			shelterId: randomUUID(),
			size_variety: 'l',
			type: 'cat',
			photo: null,
			create_date: null,
			delete_date: null,
			update_date: null
		};

		it('should validate body containing all required properties', () => {
			mockRequest.body = required;

			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).not.toThrow();
			expect(nextFunction).toBeCalledTimes(1);
		});

		it('should validate body without required properties when strictRequiredChecks=false', () => {
			mockRequest.body = optional;
			settings.strictRequiredChecks = false;

			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).not.toThrow();
			expect(nextFunction).toBeCalledTimes(1);
		});

		it('should throw for body={} with strictRequiredChecks=false', () => {
			settings.strictRequiredChecks = false;
			mockRequest.body = {};

			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(SCHEMA_ERRORS_CODE.minProperties);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for body={} with strictRequiredChecks=true', () => {
			settings.strictRequiredChecks = true;
			mockRequest.body = {};

			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(SCHEMA_ERRORS_CODE.minProperties);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for body missing required properties', () => {

			mockRequest.body = optional;
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(SCHEMA_ERRORS_CODE.required);
			
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for body containing additional properties', () => {

			mockRequest.body = {...required, any: 'any'};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(SCHEMA_ERRORS_CODE.additionalProperties);
			
			expect(nextFunction).not.toBeCalled();
		});
	});

	describe('shelterSchema validation', () => {
		let settings: any;

		beforeEach(() => {
			settings = {schema: 'shelterSchema', data: 'body',strictRequiredChecks: true};
		});

		const required = {
			user:{
				email: 'email@email.com',
				name: 'name',
				password: '12345678'
			}
		};
		const optional = {
			id: randomUUID(),
			userId: randomUUID(),
			inactive: false,
			pets: [],
			delete_date: null,
			user:{
				role: 'admin',
				id: randomUUID(),
			}
		};

		it('should validate body containing all required properties', () => {
			mockRequest.body = required;

			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).not.toThrow();
			expect(nextFunction).toBeCalledTimes(1);
		});

		it('should validate body without required properties when strictRequiredChecks=false', () => {
			mockRequest.body = optional;
			settings.strictRequiredChecks = false;

			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).not.toThrow();
			expect(nextFunction).toBeCalledTimes(1);
		});

		it('should throw for body={} with strictRequiredChecks=false', () => {
			settings.strictRequiredChecks = false;
			mockRequest.body = {};

			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(SCHEMA_ERRORS_CODE.minProperties);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for body={} with strictRequiredChecks=true', () => {
			settings.strictRequiredChecks = true;
			mockRequest.body = {};

			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(SCHEMA_ERRORS_CODE.minProperties);
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for body missing required properties', () => {

			mockRequest.body = optional;
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(SCHEMA_ERRORS_CODE.required);
			
			expect(nextFunction).not.toBeCalled();
		});

		it('should throw for body containing additional properties', () => {

			mockRequest.body = {...required, any: 'any'};
			
			expect(() => validator.validate(settings)(mockRequest as Request, mockResponse as Response, nextFunction)
			).toThrow(SCHEMA_ERRORS_CODE.additionalProperties);
			
			expect(nextFunction).not.toBeCalled();
		});
	});
});
