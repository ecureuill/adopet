import {JSONSchemaType} from 'ajv';
import { IPet, ITutor, IShelter } from '../types/json-schema-interfaces';
import { phoneRegex } from './validations';

const definitionsSchema = {
	$id: 'definitionsSchema',
	type: 'object',
	definitions: {
		'non-empty-string': {
			type: 'string',
			minLength: 1,
		},
		'non-nullable-empty-string': {
			type: 'string',
			minLength: 1,
		},
		uuid: {
			type: 'string',
			format: 'uuid'
		},
		email: {
			type: 'string',
			format: 'email'
		},
		password: {
			type: 'string',
			minLength: 8
		},
		phone: {
			type: 'string', 
			pattern: phoneRegex,
			nullable: true
		},
		city: {
			type: 'string', 
			minLength: 1,
			nullable: true
		},
		state: {
			type: 'string', 
			nullable: true,
			minLength: 2,
			maxLength: 2
		},
	},
};

export const paramSchema = {
	$id: 'paramSchema',
	type: 'object',
	required: ['id'],
	additionalProperties: false,
	properties: {
		id: {$ref: 'definitionsSchema#/definitions/uuid'},
	}
};

export const tutorSchema: JSONSchemaType<ITutor> = {
	$id: 'tutorSchema',
	type: 'object',
	properties: {
		id: { $ref: 'definitionsSchema#/definitions/uuid'},
		email: {$ref: 'definitionsSchema#/definitions/email'},
		password: {$ref: 'definitionsSchema#/definitions/password'},
		name: { $ref: 'definitionsSchema#/definitions/non-empty-string'},
		phone: {$ref: 'definitionsSchema#/definitions/phone'},
		city: {$ref: 'definitionsSchema#/definitions/non-empty-string'},
		state: {$ref: 'definitionsSchema#/definitions/state'},
		about: {$ref: 'definitionsSchema#/definitions/non-nullable-empty-string'},
		photo: {$ref: 'definitionsSchema#/definitions/non-nullable-empty-string'},
	},
	required: ['email', 'password', 'name'],
	additionalProperties: false,
	minProperties: 1,
};

export const petSchema: JSONSchemaType<IPet> = {
	$id: 'petSchema',
	type: 'object',
	required: ['name', 'age'],
	properties: {
		id: {
			type: 'string',
			format: 'uuid'
		},
		name:  {
			type: 'string', 
			minLength: 1,
		},
		age: {
			type: 'number',
			minimum: 1,
		},
		age_unit: {
			type: 'string',
			enum: ['y', 'm', 'd']
		},
		size_variety: {
			type: 'string',
			enum: ['xxs', 'xs', 's', 'm', 'l', 'xl']
		},
		type: {
			type: 'string',
			enum: ['dog', 'cat']
		},
		adopted: {type: 'boolean'},
		photo: {type: 'string', nullable: true},
		shelterId: {
			type: 'string',
			format: 'uuid'
		}
	},
	minProperties: 1,
	additionalProperties: false,

};

export const shelterSchema: JSONSchemaType<IShelter> = {
	$id: 'shelterSchema',
	type: 'object',
	additionalProperties: false,
	properties: {
		id: { $ref: 'definitionsSchema#/definitions/uuid'},
		email: {$ref: 'definitionsSchema#/definitions/email'},
		password: {$ref: 'definitionsSchema#/definitions/password'},
		name: { $ref: 'definitionsSchema#/definitions/non-empty-string'},
		phone: {$ref: 'definitionsSchema#/definitions/phone'},
		city: {$ref: 'definitionsSchema#/definitions/non-empty-string'},
		state: {$ref: 'definitionsSchema#/definitions/state'},
		pets: {
			type: 'array',
			items: petSchema,
			$id: 'shelter-petSchema',
			uniqueItems: true,
		}
	},
	required: ['email', 'password', 'name'],
	minProperties: 1 //avoid empty body on
};

const schemas = [definitionsSchema, petSchema, tutorSchema, shelterSchema, paramSchema];

export default schemas;