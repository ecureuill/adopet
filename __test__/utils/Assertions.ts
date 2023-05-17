import { Response } from 'supertest';
import { passwordCompareHash } from '../../src/services/passwords';
import { IPet, IShelter, ITutor, IUser } from '../../src/types/schemas';
import { HTTP_RESPONSE } from './consts';
import './petsToBeUpdatedOrCreated.matcher';
import './toBeWithinRange';
import { Shelter } from '../../src/entities/Shelter';
import { Tutor } from '../../src/entities/Tutor';
import { User } from '../../src/entities/User';
import { Pet } from '../../src/entities/Pet';

export class Assertions { 

	static signUPNotAllowed(res: Response){
		expect(res.body['message']).toBe('Email already exist');
		expect(res.statusCode).toBe(HTTP_RESPONSE.BadRequest);

	}

	static unauthenticated(res: Response){
		expect(res.body['message']).toBe('Missing token');
		expect(res.statusCode).toBe(HTTP_RESPONSE.Unauthorized);
	}

	static notAllowedRole(res: Response){
		expect(res.body['message']).toBe('This action is not authorized');
		expect(res.statusCode).toBe(HTTP_RESPONSE.Forbidden);
		expect(res.get('Content-Type')).toContain('application/json');
	}

	static notAllowedEntityUpdate(res: Response){
		expect(res.body['message']).toBe('PUT is not authorized');
		expect(res.statusCode).toBe(HTTP_RESPONSE.Forbidden);
		expect(res.get('Content-Type')).toContain('application/json');
	}

	static notAllowedPropertyUpdate(res: Response){
		expect(res.body['message']).toContain('update is not authorized');
		expect(res.statusCode).toBe(HTTP_RESPONSE.Forbidden);
		expect(res.get('Content-Type')).toContain('application/json');
	}

	static restrictedToOwner(res: Response){
		expect(res.body['message']).toBe('Only owner is authorized to perform this action');
		expect(res.statusCode).toBe(HTTP_RESPONSE.Forbidden);
		expect(res.get('Content-Type')).toContain('application/json');
	}

	static idReplacement(res: Response){
		expect(res.statusCode).toBe(HTTP_RESPONSE.BadRequest);
		expect(res.body['message']).toBe('id replacememt is not allowed');
		expect(res.get('Content-Type')).toContain('application/json');
	}

	static jsonSchemaError(res: Response){
		expect(res.body['error_name']).toContain('Schema Error');
		expect(res.statusCode).toBe(HTTP_RESPONSE.BadRequest);
		expect(res.get('Content-Type')).toContain('application/json');
	}

	static nonExistentId(res: Response){
		expect(res.body['message']).toContain('Não Encontrado');
		expect(res.statusCode).toBe(HTTP_RESPONSE.BadRequest);
		expect(res.get('Content-Type')).toContain('application/json');
	}

	static retrieveCompleteListEntities(res: Response){
		expect(res.statusCode).toBe(HTTP_RESPONSE.OK);
		expect(res.get('Content-Type')).toContain('application/json');
		expect(res.body['count']).not.toBeUndefined();
		expect(res.body['entities']).not.toBeUndefined();
		expect(res.body['entities']).toBeInstanceOf(Array);
		expect((res.body['entities'] as Array<object>).length).toBe(res.body['count']);		
	}

	static retrieveRestrictedListOwnedEntities(res: Response){
		expect(res.statusCode).toBe(HTTP_RESPONSE.OK);
		expect(res.get('Content-Type')).toContain('application/json');
		expect(res.body['count']).not.toBeUndefined();
		expect(res.body['entities']).not.toBeUndefined();
		expect(res.body['entities']).toBeInstanceOf(Array);
		expect(res.body['count']).toEqual(1);
		expect((res.body['entities'] as Array<object>).length).toEqual(1);	
	}

	static retrieveEntity(res: Response, entity: object){
		expect(res.statusCode).toBe(HTTP_RESPONSE.OK);
		expect(res.get('Content-Type')).toContain('application/json');

		const { id, shelterId, userId, ...current} = res.body;

		const { id: expectedId, shelterId: expectedShelterId, userId: expectedUserId, create_date: expectedCreateDate, update_date: expectedUpdateDate, delete_date: expectedDeleteDate,...expected} = entity as any;

		expect(current).toMatchObject(expected);
	}

	private static doneOK(res: Response){
		expect(res.statusCode).toBe(HTTP_RESPONSE.OK);
		expect(res.get('Content-Type')).toContain('application/json');
	}

	static created(res: Response, expectedObj: object){
		expect(res.statusCode).toBe(HTTP_RESPONSE.Created);
		expect(res.get('Content-Type')).toContain('application/json');
		expect(res.body).toMatchObject(expectedObj);
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


	static patchShelterDone(res: Response, before: Shelter, payload: Shelter){
		
		const { user: currentUser, pets: currentPets,...currentShelter } = res.body;
		const { user: beforeUser, pets: beforePets,...beforeShelter } = before;
		const { user: payloadUser, pets: payloadPets,...payloadShelter } = payload;

		this.doneOK(res);
		this.patchUser(currentUser, beforeUser, payloadUser);
		this.matchPatchedObj(payloadShelter as Shelter, beforeShelter as Shelter, currentShelter as Shelter);
		this.patchPets(payloadPets, beforePets, currentPets);
	}

	static patchPetDone(res: Response, before: Pet, payload: Pet){
		
		this.doneOK(res);

		const {shelter,...current} = res.body as Pet;

		this.matchPatchedObj(payload, before,current);
	}

	static patchTutorDone(res: Response, before: Tutor, payload: Tutor){
		
		const { user: currentUser,...currentTutor } = res.body;
		const { user: beforeUser,...beforeTutor } = before;
		const { user: payloadUser,...payloadTutor } = payload;

		this.doneOK(res);
		this.patchUser(currentUser, beforeUser, payloadUser);
		this.matchPatchedObj(payloadTutor as Tutor, beforeTutor as Tutor, currentTutor as Tutor);
	}

	static patchUserDone(res: Response, before: User, payload: User){
		
		this.doneOK(res);

		this.patchUser(res.body, before, payload);
	}
	
	private static patchUser(current: User, before: User, payload: User){
		
		if(payload.password !== undefined){

			const {password: hashedPwd, ...partialCurr} = current;
			const {password: plainPwd, ...partialPay} = payload;
			const {password: beforePWD, ...partialBef} = before;

			expect(passwordCompareHash(hashedPwd, plainPwd));
			this.matchPatchedObj(partialPay, partialBef, partialCurr);
		}
		else
			this.matchPatchedObj(payload, before, current);
	}

	static patchPets(before: Pet[], current: Pet[], petsPayload: any){
		if(petsPayload === undefined)
		{
			expect(current).toEqual(before);
		}
		else
		{
			const petsToBeCreated = (petsPayload as IPet[]).filter(p => p.id === undefined);

			const petsCreated = current.filter(p => p.create_date === p.update_date);

			expect(petsCreated.length).toMatchObject(petsToBeCreated.length);

			const petsToBeUpdated = (petsPayload as IPet[]).filter(p => p.id !== undefined);
			const petsToBeUpdatedIndex = petsToBeUpdated.map(p => p.id);
			const petsUpdated = current.filter(p => petsToBeUpdatedIndex.includes(p.id)
			);

			expect(petsUpdated.length).toMatchObject(petsToBeUpdated.length);

			petsUpdated.forEach(pU => this.matchPatchedArrayObj(petsToBeUpdated, before, pU));
			
			const petsNotToBeAltered = current.filter(p => !petsToBeUpdatedIndex.includes(p.id));

			const petsNotAltered = current.filter(p => !petsCreated.includes(p) && !petsUpdated.includes(p));

			expect(petsNotAltered.length).toMatchObject(petsNotToBeAltered.length);

			expect(petsNotAltered).toEqual(petsNotToBeAltered);
		}
	}

	static delete(res: Response){
		expect(res.get('Content-Type')).toContain('application/json');
		expect(res.statusCode).toBe(HTTP_RESPONSE.OK);
		expect(res.body['delete_date']).not.toBeUndefined();
		expect(res.body['delete_date']).not.toBe('');
	}

	private static matchUser(userPayload: IUser, userResp: User){
		
		const {password: hashedPwd, ...partialRes} = userResp;
		const {password: plainPwd, ...partialUser} = userPayload;

		expect(partialRes).toMatchObject(partialUser);
		expect(passwordCompareHash(hashedPwd, plainPwd));
	}

	private static matchTutor(tutorPayload: ITutor, tutorRes: Tutor){

		const { user, ...partialPayload } = tutorPayload;
		const { user: userResponse, ...partialResponse } = tutorRes;

		this.matchUser(user, userResponse);
		
		expect(partialResponse).toMatchObject(partialPayload);
	}

	private static matchShelter(shelterPayload: IShelter, shelterRes: Shelter){

		const { user, pets,...partialPayload } = shelterPayload;
		const { user: userResponse, pets: petsResponse, ...partialResponse } = shelterRes;

		this.matchUser(user, userResponse);
		
		expect(partialResponse).toMatchObject(partialPayload);

		expect(petsResponse).petsToBeUpdatedOrCreated(pets);

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
		Object.keys(current).forEach((key) => {
			const K = key as keyof I;
			if(!['create_date', 'update_date', 'delete_date'].includes(K as string))
			{		
				const payLValue = payload[K];
				if(payLValue === undefined)
					expect(current[key as keyof I]).toEqual(before[K]);
				else
				{
					expect(current[K]).toEqual(payLValue);
				}
			}
		});
	}

}