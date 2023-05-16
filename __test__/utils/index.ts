import Ajv from 'ajv';
import schemas from '../../src/services/schemas';
import addFormats from 'ajv-formats';
import { User } from '../../src/entities/User';
import { Role } from '../../src/types/enums';
import { createJwtToken } from '../../src/services/tokens';
import { Tutor } from '../../src/entities/Tutor';
import { Shelter } from '../../src/entities/Shelter';

// export const validateSchema = (body: object, schema: 'userSchema' | 'shelterSchema' | 'tutorSchema' | 'petSchema') => {
// 	const ajv = new Ajv({schemas: schemas, allErrors: true});
// 	addFormats(ajv);
// 	const validateAjv = ajv.getSchema(schema);
// 	if(validateAjv !== undefined){
// 		const result = validateAjv(body);
// 		console.debug(validateAjv.errors);
// 		return result;
// 	}

// 	throw new Error('Schema not founded');
// };

// export const getTokens = async () => {

// 	const tokenAdmin = await findUserAndCreateToken('admin@mail.com');
// 	const tokenShelter = await findUserAndCreateToken('abrigo@mail.com');
// 	const tokenTutor = await findUserAndCreateToken('tutor@mail.com');

// 	return {
// 		tokenAdmin, tokenShelter, tokenTutor
// 	};
// };

// export const findUserAndCreateToken = async (email: string) => {

// 	const loggedUser = await User.findOneByOrFail({email: email});
// 	return  createJwtToken({id: loggedUser.id, role: loggedUser.role });
// };

// export const findTutorUserAndCreateToken = async (id: string) => {
// 	const tutor = await Tutor.findOneByOrFail({id: id});
// 	return  createJwtToken({id: tutor.userId, role: Role.TUTOR });
// };

// export const findShelterUserAndCreateToken = async (id: string) => {
// 	const shelter = await Shelter.findOneByOrFail({id: id});
// 	return  createJwtToken({id: shelter.userId, role: Role.SHELTER });
// };