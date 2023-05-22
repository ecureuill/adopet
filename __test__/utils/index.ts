import Ajv from 'ajv';
import schemas from '../../src/services/schemas';
import addFormats from 'ajv-formats';
import { User } from '../../src/entities/User';
import { Role } from '../../src/types/enums';
import { createJwtToken } from '../../src/services/tokens';
import { Tutor } from '../../src/entities/Tutor';
import { Shelter } from '../../src/entities/Shelter';
import { isArray } from 'util';

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

export const getTokens = async () => {

	const tokenAdmin = await findUserAndCreateToken('admin@mail.com');
	const tokenShelter = await findUserAndCreateToken('abrigo@mail.com');
	const tokenTutor = await findUserAndCreateToken('tutor@mail.com');

	return {
		tokenAdmin, tokenShelter, tokenTutor
	};
};

export const findUserAndCreateToken = async (email: string) => {

	const loggedUser = await User.findOneByOrFail({email: email});
	return  createJwtToken({id: loggedUser.id, role: loggedUser.role });
};

export const findTutorUserAndCreateToken = async (id: string) => {
	const tutor = await Tutor.findOneByOrFail({id: id});
	return  createJwtToken({id: tutor.userId, role: Role.TUTOR });
};

export const findShelterUserAndCreateToken = async (id: string) => {
	const shelter = await Shelter.findOneByOrFail({id: id});
	return  createJwtToken({id: shelter.userId, role: Role.SHELTER });
};

const normalizeDate = (date: any) => {
	let ndate = new Date(date).toISOString();
	if(date === null)
		ndate = new Date(date.toString()).toISOString();

	return ndate;
};
export const normalizeEntities = (entities: any[], isRemoveSensity = false) => {
	
	if(entities.length > 1){
		entities = entities.sort((a: any, b: any)=> a.id < b.id ? 1 : -1);
	}

	return entities.reduce((previous: any[], current: any) => {
		normalizeEntity(current);
		if(isRemoveSensity)
			current = removeSensity(current);

		previous.push(current);
		return previous;
	}, []);
};

export const normalizeEntity = (entity: any) => {
	if(entity?.photo !== undefined && entity?.photo !== null) 
		if(Buffer.isBuffer(entity.photo))
			entity.photo = entity.photo.toString();
		else if(typeof entity.photo === 'object')
			entity.photo = Buffer.from(entity.photo).toString();

	if(entity?.update_date !== undefined && entity?.update_date !== null)
		entity.update_date = normalizeDate(entity.update_date);

	if(entity?.create_date !== undefined && entity?.create_date !== null)
		entity.create_date = normalizeDate(entity.create_date);

	if(entity?.delete_date !== undefined && entity?.delete_date !== null)
		entity.delete_date = normalizeDate(entity.delete_date);

	if(entity?.user !== undefined)
		normalizeEntity(entity.user);
};

export const removeSensity = (entity: any): any => {
	if(isArray(entity))
		return entity.map(item=> removeSensity(item));
	
	const { 
		id, 
		userId, 
		shelterId, 
		password, 
		role, 
		...partial
	} = entity;

	if(entity.user !== undefined && entity.user !== null)
		partial.user = removeSensity(entity.user);

	if(entity.pets !== undefined && entity.pets !== null)
		partial.pets = (entity.pets as []).map(pet => removeSensity(pet));
	return partial;
};