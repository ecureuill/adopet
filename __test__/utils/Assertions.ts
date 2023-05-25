import { Response } from 'supertest';
import { normalizeEntities, normalizeEntity, removeSensity } from '.';
import { Pet } from '../../src/entities/Pet';
import { Shelter } from '../../src/entities/Shelter';
import { Tutor } from '../../src/entities/Tutor';
import { User } from '../../src/entities/User';
import { passwordCompareHash } from '../../src/services/passwords';
import { IPet, IShelter, ITutor, IUser } from '../../src/types/schemas';
import { HTTP_RESPONSE } from './consts';
import { Adoption } from '../../src/entities/Adoption';

export class Assertions { 

	static signUPNotAllowed(res: Response){
		expect(res.body.message).toBe('Email already exist');
		expect(res.statusCode).toBe(HTTP_RESPONSE.BadRequest);
	}

	static adoptionNotAllowed(res: Response){
		expect(res.body.message).toBe('Pet already adopted');
		expect(res.statusCode).toBe(HTTP_RESPONSE.BadRequest);
	}

	static unauthenticated(res: Response){
		expect(res.body.message).toBe('Missing token');
		expect(res.statusCode).toBe(HTTP_RESPONSE.Unauthorized);
	}

	static notAllowedRole(res: Response){
		expect(res.body.message).toBe('This action is not authorized');
		expect(res.statusCode).toBe(HTTP_RESPONSE.Forbidden);
		expect(res.get('Content-Type')).toContain('application/json');
	}

	static notAllowedEntityUpdate(res: Response){
		expect(res.body.message).toBe('PUT is not allowed');
		expect(res.statusCode).toBe(HTTP_RESPONSE.MethodNotAllowed);
		expect(res.get('Content-Type')).toContain('application/json');
	}

	static notAllowedPropertyUpdate(res: Response){
		expect(res.body.message).toContain('update is not authorized');
		expect(res.statusCode).toBe(HTTP_RESPONSE.Forbidden);
		expect(res.get('Content-Type')).toContain('application/json');
	}

	static restrictedToOwner(res: Response){
		expect(res.body.message).toBe('Only owner is authorized to perform this action');
		expect(res.statusCode).toBe(HTTP_RESPONSE.Forbidden);
		expect(res.get('Content-Type')).toContain('application/json');
	}

	static idReplacement(res: Response){
		expect(res.statusCode).toBe(HTTP_RESPONSE.BadRequest);
		expect(res.body.message).toBe('id replacememt is not allowed');
		expect(res.get('Content-Type')).toContain('application/json');
	}

	static jsonSchemaError(res: Response){
		expect(res.body.error_name).toContain('Schema Error');
		expect(res.statusCode).toBe(HTTP_RESPONSE.BadRequest);
		expect(res.get('Content-Type')).toContain('application/json');
	}

	static nonExistentId(res: Response){
		expect(res.statusCode).toBe(HTTP_RESPONSE.BadRequest);
		expect(res.body.message).toContain('Resource do not exist');
		expect(res.get('Content-Type')).toContain('application/json');
	}

	static retrieveCompleteListEntities(res: Response, entities: object[], isRemoveSensitive = false){
		
		this.doneOK(res);
		
		expect(res.body.count).toEqual(entities.length);
		expect(res.body.entities).toBeInstanceOf(Array);
		expect((res.body.entities as Array<object>).length).toBe(res.body.count);

		this.matchEntities(res.body.entities, entities, isRemoveSensitive);
	}

	static retrieveRestrictedListOwnedEntities(res: Response, entities: object[], isRemoveSensitive = false){
		this.doneOK(res);
		
		expect((res.body.entities as Array<object>).length).toEqual(entities.length);	
		expect(res.body.count).toEqual(entities.length);
		expect(res.body.entities).toBeInstanceOf(Array);

		this.matchEntities(res.body.entities, entities, isRemoveSensitive);
	}

	static retrieveEntity(res: Response, entity: object, isRemoveSensitive = false){
		this.doneOK(res);

		this.matchEntity(res.body, entity, isRemoveSensitive);
	}

	static doneOK(res: Response){
		expect(res.statusCode).toBe(HTTP_RESPONSE.OK);
		expect(res.get('Content-Type')).toContain('application/json');
	}

	static created(res: Response, expectedObj: object | Adoption){
		expect(res.statusCode).toBe(HTTP_RESPONSE.Created);
		expect(res.get('Content-Type')).toContain('application/json');

		this.matchEntity(res.body, expectedObj);
	}
	
	static putUserDone(res: Response, user: IUser){
		this.doneOK(res);

		this.matchUser(user, res.body);
	}

	static putTutorDone(res: Response, tutor: ITutor){
		this.doneOK(res);
		this.matchTutor(tutor, res.body);
	}

	static putShelterDone(res: Response, shelter: IShelter){
		this.doneOK(res);
		this.matchShelter(shelter, res.body);
	}

	static putPetDone(res: Response, pet: IPet){
		this.doneOK(res);
		expect(res.body).toMatchObject(pet);
	}

	static patchShelterDone(res: Response, before: Shelter, payload: any){

		normalizeEntity(res.body);
		normalizeEntity(before);
		normalizeEntity(payload);

		const { user: currentUser, pets: currentPets,...currentShelter } = res.body;
		const { user: beforeUser, pets: beforePets,...beforeShelter } = before;
		const { user: payloadUser, pets: payloadPets,...payloadShelter } = payload;

		this.doneOK(res);
		this.patchUser(currentUser, beforeUser, payloadUser);
		this.matchPatchedObj(payloadShelter as Shelter, beforeShelter as Shelter, currentShelter as Shelter);
		this.patchPets(beforePets, currentPets, payloadPets);
	}

	static patchPetDone(res: Response, before: Pet, payload: Pet){
		
		this.doneOK(res);

		const {shelter,...current} = res.body as Pet;

		this.matchPatchedObj(payload, before,current);
	}

	static patchTutorDone(res: Response, before: ITutor, payload: Partial<ITutor>){
		
		const {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			photo: currentPhoto, 
			user: currentUser,
			...currentTutor 
		} = res.body;
		const {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			photo: beforePhoto, 
			user: beforeUser,
			...beforeTutor 
		} = before;
		const {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			photo: payloadPhoto,
			user: payloadUser,
			...payloadTutor 
		} = payload;

		this.doneOK(res);
		
		if(payloadUser !== undefined)
			this.patchUser(currentUser, beforeUser, payloadUser);

		this.matchPatchedObj(payloadTutor, beforeTutor, currentTutor);
	}

	static patchUserDone(res: Response, before: User, payload: User){
		
		this.doneOK(res);

		this.patchUser(res.body, before, payload);
	}
	
	private static patchUser(current: IUser, before: IUser, payload: any){

		normalizeEntity(before);
		normalizeEntity(current);
		normalizeEntity(payload);

		if(payload?.password !== undefined){
			const {password: plainPwd, ...partialPay} = payload;
			const {password: hashedPwd, ...partialCurr} = current;
			const {password: beforePWD, ...partialBef} = before;

			expect(passwordCompareHash(hashedPwd, plainPwd as string));
			
			this.matchPatchedObj(partialPay, partialBef, partialCurr);
		}
		else
			this.matchPatchedObj(payload, before, current);
	}

	static patchPets(before: Pet[], current: Pet[], petsPayload: any){

		if(petsPayload === undefined)
		{
			expect(current.reduce((previous: any[], current: any) => {
				normalizeEntity(current);
				previous.push(current);
				return previous;
			}, [])).toEqual(before.reduce((previous: any[], current: any) => {
				normalizeEntity(current);
				previous.push(current);
				return previous;
			}, []));
		}
		else
		{
			const beforeIds = before.map(p=> p.id);

			const petsToBeCreated = (petsPayload as IPet[]).filter(p => p.id === undefined).reduce((previous: any[], current: any) => {
				normalizeEntity(current);
				previous.push(current);
				return previous;
			}, []);

			const petsCreated = current.filter(p => p.create_date === p.update_date && !beforeIds.includes(p.id)).reduce((previous: any[], current: any) => {
				normalizeEntity(current);
				previous.push(current);
				return previous;
			}, []);

			expect(petsCreated.length).toEqual(petsToBeCreated.length);
			expect(petsCreated.length).toEqual(0);
			
			const petsToBeUpdated = (petsPayload as IPet[]).filter(p => p.id !== undefined).reduce((previous: any[], current: any) => {
				normalizeEntity(current);
				previous.push(current);
				return previous;
			}, []);

			const petsToBeUpdatedIndex = petsToBeUpdated.map(p => p.id);
			const petsUpdated = current.filter(p => petsToBeUpdatedIndex.includes(p.id)
			).reduce((previous: any[], current: any) => {
				normalizeEntity(current);
				previous.push(current);
				return previous;
			}, []);

			expect(petsUpdated.length).toEqual(1);
			expect(petsUpdated.length).toEqual(petsToBeUpdated.length);

			petsUpdated.forEach(pU => this.matchPatchedArrayObj(petsToBeUpdated, before, pU));
			
			const petsNotToBeAltered = current.filter(p => !petsToBeUpdatedIndex.includes(p.id)).reduce((previous: any[], current: any) => {
				normalizeEntity(current);
				previous.push(current);
				return previous;
			}, []);

			const petsNotAltered = current.filter(p => !petsCreated.includes(p) && !petsUpdated.includes(p)).reduce((previous: any[], current: any) => {
				normalizeEntity(current);
				previous.push(current);
				return previous;
			}, []);

			expect(petsNotAltered.length).toEqual(petsNotToBeAltered.length);

			expect(petsNotAltered).toMatchObject(petsNotToBeAltered);
		}
	}

	static delete(res: Response){
		this.doneOK(res);
	}

	static sofDelete(res: Response){
		this.doneOK(res);
		expect(res.body.delete_date).not.toBeUndefined();
		expect(res.body.delete_date).not.toBe('');
	}

	private static matchEntities(responseEntity: any[], payloadEntity: any[], isRemoveSensitive = false){
		
		const currents: any[] = [];
		const currentsUsers: any[] = [];
		const petsCurrents: any[] = [];
		const petCurrents: any[] = [];
		const tutorCurrents: any[] = [];
		const shelterCurrents: any[] = [];

		for (const item of responseEntity){
			const { 
				pets,
				pet,
				user,
				tutor,
				shelter,
				...partial
			} = item ?? {};

			currents.push(partial);
			if(user !== undefined)
				currentsUsers.push(user);

			if(pets !== undefined)
				petsCurrents.push(...pets);

			if(pet !== undefined)
				petCurrents.push(pet);

			if(tutor !== undefined)
				tutorCurrents.push(tutor);

			if(shelter !== undefined)
				shelterCurrents.push(shelter);
		}	

		const expecteds: any[] = [];
		const expectedsPets: any[] = [];
		const expectedsUsers: any[] = [];
		const expectedsPet: any[] = [];
		const expectedsTutors: any[] = [];
		const expectedsShelters: any[] = [];

		for (const item of payloadEntity){
			const { 
				pets,
				pet,
				user,
				tutor,
				shelter,
				...partial
			} = item ?? {};

			expecteds.push(partial);
			
			if(user !== undefined)
				expectedsUsers.push(user);

			if(pets !== undefined)
				expectedsPets.push(...pets);

			if(pet !== undefined)
				expectedsPet.push(pet);

			if(tutor !== undefined)
				expectedsTutors.push(tutor);

			if(shelter !== undefined)
				expectedsShelters.push(shelter);
		}

		expect(currents.length).toEqual(expecteds.length);
		
		for(const current of currents){
			normalizeEntity(current); 
			
			let expected = null;
			if(current.id !== undefined)
				expected = expecteds.find( exp => exp.id === current.id);
			else if(current.email !== undefined)
				expected = expecteds.find( exp => exp.email === current.email);
			else{
				//TO-DO how to validate when there is no unique-identify
				// console.error(current)
			}

			if(expected !== null && expected !== undefined){
				normalizeEntity(expected); 
				if(isRemoveSensitive){
					expected = removeSensity(expected);
				}
				expect(current).toMatchObject(expected);
			}
		}

		//// TODO Why changes sequence???
		// const current = currents.map( item => {
		// 	normalizeEntity(item); 
		// 	return item;
		// });
		// const expected = expecteds.map( item => {
		// 	normalizeEntity(item); 
		// 	if(isRemoveSensitive)
		// 		return removeSensity(item);
		// 	return item;
		// });
		// expect(current).toMatchObject(expected);

		if(expectedsPet.length > 0 || petCurrents.length > 0){
			expect(expectedsPet.length).toEqual(petCurrents.length);
			this.matchEntities(petCurrents, expectedsPet, isRemoveSensitive);
		}

		if(expectedsTutors.length > 0 || tutorCurrents.length > 0){
			expect(expectedsTutors.length).toEqual(tutorCurrents.length);
			this.matchEntities(expectedsTutors, tutorCurrents, isRemoveSensitive);
		}

		if(expectedsShelters.length > 0 || shelterCurrents.length > 0){
			expect(expectedsShelters.length).toEqual(shelterCurrents.length);
			this.matchEntities(expectedsShelters, shelterCurrents, isRemoveSensitive);
		}
		
		if(currentsUsers.length > 0 || expectedsUsers.length > 0){
			expect(currentsUsers.length).toEqual(expectedsUsers.length);
			this.matchEntities(currentsUsers, expectedsUsers, isRemoveSensitive);
		}
		
		if(petsCurrents.length > 0 || expectedsPets.length > 0){
			expect(petsCurrents.length).toEqual(expectedsPets.length);
			this.matchEntities(petsCurrents, expectedsPets, isRemoveSensitive);
		}
	}

	private static matchEntity(responseEntity: any, payloadEntity: any, isRemoveSensitive = false){

		normalizeEntity(responseEntity);
		normalizeEntity(payloadEntity);

		if(isRemoveSensitive)
			payloadEntity = removeSensity(payloadEntity); 

		const { 
			password : {password} = '',
			pets,
			pet,
			user,
			tutor,
			shelter,
			delete_date = '',
			create_date = '',
			update_date = '',
			...current
		} = responseEntity ?? {};

		const { 
			password: expectedPassword,
			pets: expectedPets,
			pet: expectedPet,
			user: expectedUser,
			tutor: expectedTutor,
			shelter: expectedShelter,
			delete_date: expectedDelete_date,
			create_date: expectedCreate_date,
			update_date: expectedUpdate_date,
			...expected
		} = payloadEntity ?? {};

		if(password !== undefined)
			expect(passwordCompareHash(expectedPassword, password));

		if(pet !== undefined || expectedPet !== undefined)
			this.matchEntity(pet, expectedPet);

		if(tutor !== undefined || expectedTutor !== undefined)
			this.matchEntity(tutor, expectedTutor);

		if(shelter !== undefined || expectedShelter !== undefined)
			this.matchEntity(shelter, expectedShelter);

		if(user !== undefined || expectedUser !== undefined)
			this.matchEntity(user, expectedUser);

		if(pets !== undefined || expectedPets !== undefined){

			const pCurrent = (pets as []).reduce((previous: any[], current: any) => {
				normalizeEntity(current);
				previous.push(current);
				return previous;
			}, []);

			const pExpected = (expectedPets as []).reduce((previous: any[], current: any) => {
				normalizeEntity(current);
				previous.push(current);
				return previous;
			}, []);

			this.matchEntity(pCurrent, pExpected);
		}

		expect(current).toMatchObject(expected);
	}

	private static matchUser(tutorPayload: any, tutorRes: any){
		const { 
			password, //plain text
			...partialPayload 
		} = tutorPayload as any;
		
		const { 
			password: passwordResponse, 
			...partialResponse 
		} = tutorRes;

		this.matchEntity(partialResponse, partialPayload);
	}
	
	private static matchAdoption(responseEntity: Adoption, payloadEntity: Adoption, isRemoveSensitive = false){

		if(isRemoveSensitive)
			payloadEntity = removeSensity(payloadEntity); 

		const { 
			pet,
			tutor,
			...current
		} = responseEntity;

		const { 
			pet:  expectedPet,
			tutor: expectedTutor,
			...expected
		} = payloadEntity;

		if(pet !== undefined || expectedPet !== undefined){

			this.matchEntity(pet, expectedPet);
		}

		if(tutor !== undefined || expectedTutor !== undefined)
			this.matchTutor(tutor, expectedTutor);

		this.matchEntity(current, expected);
	}

	private static matchTutor(tutorPayload: any, tutorRes: any){
		const { 
			user, 
			...partialPayload 
		} = tutorPayload ?? {};	
		
		const { 
			user: userResponse, 
			...partialResponse 
		} = tutorRes;

		if(user !== undefined || userResponse !== undefined){
			
			this.matchUser(user === undefined? {} as IUser : user as IUser, 
				userResponse === undefined? {} as User : userResponse as User);
		}

		this.matchEntity(partialResponse, partialPayload);
	}

	private static matchShelter(shelterPayload: IShelter, shelterRes: Shelter){

		const { user, pets,...partialPayload } = shelterPayload;
		const { user: userResponse, pets: petsResponse, ...partialResponse } = shelterRes;

		this.matchUser(user, userResponse);
		
		expect(partialResponse).toMatchObject(partialPayload);

		// expect(petsResponse).petsToBeUpdatedOrCreated(pets);

	}

	private static matchPatchedArrayObj<I extends object>(payloads: I[], before: I[], current: I){
		const ID = 'id' as keyof I;

		const payload = payloads.find(p => current[ID] === p[ID]);
		if(payload === undefined)
			throw new Error('Can`t identify payload');

		const original = before.find(p => current[ID] === p[ID]);
		if(original === undefined)
			throw new Error('Can`t identify original');
		
		this.matchPatchedObj(payload, original, current);
	}

	private static matchPatchedObj<I extends object>(payload: I, before: I, current: I){

		if(payload !== undefined && payload !== null)
			Object.keys(payload).forEach((key) => {
				const K = key as keyof I;
				// if(!['create_date', 'update_date', 'delete_date'].includes(K as string))
				// {		
				// console.log(K);
				const payLValue = payload[K];
				if(payLValue === undefined)
					expect(current[key as keyof I]).toEqual(before[K]);
				else
				{
					expect(current[K]).toEqual(payLValue);
				}
				// }
			});
	}

}