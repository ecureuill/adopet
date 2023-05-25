import { randomUUID } from 'crypto';
import { DataSource, EntityNotFoundError, TypeORMError } from 'typeorm';

import AdoptionController from '../../../src/controller/adoption.controller';
import { Adoption } from '../../../src/entities/Adoption';
import { Pet } from '../../../src/entities/Pet';
import { Shelter } from '../../../src/entities/Shelter';
import { Tutor } from '../../../src/entities/Tutor';
import * as validations from '../../../src/services/validations';
import { Role } from '../../../src/types/enums';
import { IUserSettings } from '../../../src/types/interfaces';
import { AdoptionError, NotOwnerError } from '../../../src/utils/errors/business.errors';

import { generateAdoptionData, generatePetData, generateShelterData, generateTutorData } from '../../utils/generate';

describe('Adoption Controller', () => {
	let settings: IUserSettings;
	const id = randomUUID();
	let petFindOneByOrFail: jest.SpyInstance;
	let tutorFindOneByOrFail: jest.SpyInstance;
	let adoptionFindOneByOrFail: jest.SpyInstance;
	let adoptionFindOneBy: jest.SpyInstance;
	let transaction: jest.SpyInstance;
	let checkPetOwner: jest.SpyInstance;
	let adoptionSave: jest.SpyInstance;

	beforeAll(()=> {
		petFindOneByOrFail = jest.spyOn(Pet, 'findOneByOrFail');
		tutorFindOneByOrFail = jest.spyOn(Tutor, 'findOneByOrFail');	
		adoptionFindOneByOrFail = jest.spyOn(Adoption, 'findOneByOrFail');
		adoptionFindOneBy = jest.spyOn(Adoption, 'findOneBy');
		adoptionSave = jest.spyOn(Adoption, 'save');
		transaction = jest.spyOn(DataSource.prototype, 'transaction');
		checkPetOwner = jest.spyOn(validations, 'checkPetOwner');
	});

	beforeEach(() => {
		settings = {
			authenticated: false,
			id: id,
			permission: {
				granted: true,
				excluded: [],
				included: undefined,
				ownershipRequired: true
			},
			role: Role.SHELTER
		};

		jest.resetAllMocks();
	});

	describe('create', () => {
		let pet: Pet;
		let tutor: Tutor; 
		let shelter: Shelter; 
		
		const body = {
			petId: randomUUID(),
			tutorId: randomUUID()
		} as Partial<Adoption>;

		beforeAll(() => {
			pet = generatePetData({id: body.petId}) as Pet;
			tutor = generateTutorData({tutor: {id: body.tutorId}}) as Tutor;
			shelter = generateShelterData({shelter: {id: pet.shelterId}, user:{id: id}}) as Shelter;
		});

		it('should create: Role.SHELTER owner', async () => {

			adoptionFindOneBy.mockResolvedValue(null);
			petFindOneByOrFail.mockResolvedValue(pet);
			tutorFindOneByOrFail.mockResolvedValue(tutor);
			checkPetOwner.mockResolvedValue(true);

			const expected = {
				...body,
				pet: {...pet, adopted: true	},
				tutor: tutor,
				shelterId: shelter.id
			} as Adoption;
			
			adoptionSave.mockResolvedValue(expected);

			const controller = new AdoptionController(settings);
			const result = await controller.create(body as Adoption);
			
			expect(result).toMatchObject(expected);
			
			expect(adoptionFindOneBy).toBeCalledTimes(1);
			expect(petFindOneByOrFail).toBeCalledTimes(1);
			expect(tutorFindOneByOrFail).toBeCalledTimes(1);
			expect(checkPetOwner).toBeCalledTimes(1);
			expect(adoptionSave).toBeCalledTimes(1);
		});

		it('should create: Role.ADMIN', async () => {
			settings.permission.ownershipRequired = false;
			settings.role = Role.ADMIN;

			adoptionFindOneBy.mockResolvedValue(null);
			petFindOneByOrFail.mockResolvedValue(pet);
			tutorFindOneByOrFail.mockResolvedValue(tutor);

			const expected = {
				...body,
				pet: {...pet, adopted: true	},
				tutor: tutor,
				shelterId: shelter.id
			} as Adoption;
			adoptionSave.mockResolvedValue(expected);

			const controller = new AdoptionController(settings);
			const result = await controller.create(body as Adoption);
			
			expect(result).toMatchObject(expected);
			
			expect(adoptionFindOneBy).toBeCalledTimes(1);
			expect(petFindOneByOrFail).toBeCalledTimes(1);
			expect(tutorFindOneByOrFail).toBeCalledTimes(1);
			expect(checkPetOwner).toBeCalledTimes(0);
			expect(adoptionSave).toBeCalledTimes(1);
		});

		it('should not create: Role.SHELTER not-owner', async () => {
			pet.shelterId = randomUUID();
			adoptionFindOneBy.mockResolvedValue(null);
			petFindOneByOrFail.mockResolvedValue(pet);
			tutorFindOneByOrFail.mockResolvedValue(tutor);
			checkPetOwner.mockRejectedValue(new NotOwnerError());

			const controller = new AdoptionController(settings);
			const result = controller.create(body as Adoption);
			
			await expect(result).rejects.toThrow(NotOwnerError);
			
			expect(adoptionFindOneBy).toBeCalledTimes(1);
			expect(petFindOneByOrFail).toBeCalledTimes(1);
			expect(tutorFindOneByOrFail).toBeCalledTimes(1);
			expect(checkPetOwner).toBeCalledTimes(1);
			expect(transaction).not.toBeCalled();
		});

		it('should not create: transaction failure', async () => {
			adoptionFindOneBy.mockResolvedValue(null);
			petFindOneByOrFail.mockResolvedValue(pet);
			tutorFindOneByOrFail.mockResolvedValue(tutor);
			adoptionSave.mockRejectedValue(new TypeORMError('some error'));
			checkPetOwner.mockResolvedValue(true);

			const controller = new AdoptionController(settings);
			const result = controller.create(body as Adoption);
			
			await expect(result).rejects.toThrow(TypeORMError);
			
			expect(adoptionFindOneBy).toBeCalledTimes(1);
			expect(petFindOneByOrFail).toBeCalledTimes(1);
			expect(tutorFindOneByOrFail).toBeCalledTimes(1);
			expect(checkPetOwner).toBeCalledTimes(1);
			expect(adoptionSave).toBeCalledTimes(1);
		});	

		it('should not create: tutorId not-existent', async () => {
			adoptionFindOneBy.mockResolvedValue(null);
			petFindOneByOrFail.mockResolvedValue(pet);
			tutorFindOneByOrFail.mockRejectedValue(new EntityNotFoundError(Pet, 'id=id'));

			const controller = new AdoptionController(settings);
			const result = controller.create(body as Adoption);
			
			await expect(result).rejects.toThrow(EntityNotFoundError);
			
			expect(adoptionFindOneBy).toBeCalledTimes(1);
			expect(petFindOneByOrFail).toBeCalledTimes(1);
			expect(tutorFindOneByOrFail).toBeCalledTimes(1);
			expect(checkPetOwner).not.toBeCalled();
			expect(transaction).not.toBeCalled();
		});

		it('should not create: petId not-existent', async () => {
			adoptionFindOneBy.mockResolvedValue(null);
			petFindOneByOrFail.mockRejectedValue(new EntityNotFoundError(Pet, 'id=id'));
			
			const controller = new AdoptionController(settings);
			const result = controller.create(body as Adoption);
						
			await expect(result).rejects.toThrow(EntityNotFoundError);
			
			expect(adoptionFindOneBy).toBeCalledTimes(1);
			expect(petFindOneByOrFail).toBeCalledTimes(1);
			expect(tutorFindOneByOrFail).not.toBeCalled();
			expect(checkPetOwner).not.toBeCalled();
			expect(transaction).not.toBeCalled();
		});

		it('should not create: pet already adopted', async () => {
			adoptionFindOneBy.mockResolvedValue(new Adoption());
			
			const controller = new AdoptionController(settings);
			try {
				const result = await controller.create(body as Adoption);
			}
			catch(error){
				expect(error).toBeInstanceOf(AdoptionError);
			}
			finally
			{
				expect(adoptionFindOneBy).toBeCalledTimes(1);
				expect(petFindOneByOrFail).not.toBeCalled();
				expect(tutorFindOneByOrFail).not.toBeCalled();
				expect(checkPetOwner).not.toBeCalled();
				expect(transaction).not.toBeCalled();
				expect.assertions(6);
			}		
		});
	});

	describe('delete', () => {
		const adoption: Adoption = generateAdoptionData({adoption: {delete_date: null}}) as Adoption;
		// const deletedAdoption = generateAdoptionData({
		// 	adoption: {
		// 		id: adoption.id, 
		// 		delete_date: Date.toString()
		// 	}, 
		// 	pet: {...adoption.pet}, 
		// 	tutor: {...adoption.tutor}
		// });

		it('should delete: Role.SHELTER owner', async () => {
			adoptionFindOneByOrFail.mockResolvedValue(adoption);
			petFindOneByOrFail.mockResolvedValue(adoption.pet);
			transaction.mockResolvedValue(null);
			checkPetOwner.mockResolvedValue(true);

			const controller = new AdoptionController(settings);
			const result = await controller.delete(adoption.id);

			// expect(result.delete_date).not.toBeNull();
			// expect(result.pet.adopted).toBe(false);

			expect(adoptionFindOneByOrFail).toHaveBeenCalledTimes(1);
			expect(petFindOneByOrFail).toHaveBeenCalledTimes(1);
			expect(transaction).toHaveBeenCalledTimes(1);
			expect(checkPetOwner).toHaveBeenCalledTimes(1);
		});

		it('should delete: Role.ADMIN', async () => {
			settings.permission.ownershipRequired = false;
			settings.role = Role.ADMIN;

			adoptionFindOneByOrFail.mockResolvedValue(adoption);
			petFindOneByOrFail.mockResolvedValue(adoption.pet);
			transaction.mockResolvedValue(null);

			const controller = new AdoptionController(settings);
			const result = await controller.delete(adoption.id);

			// expect(result.delete_date).not.toBeNull();
			// expect(result.pet.adopted).toBe(false);

			expect(adoptionFindOneByOrFail).toHaveBeenCalledTimes(1);
			expect(petFindOneByOrFail).toHaveBeenCalledTimes(1);
			expect(transaction).toHaveBeenCalledTimes(1);
			expect(checkPetOwner).toHaveBeenCalledTimes(0);
		});

		it('should throw NotOwnerError: Role.SHELTER not-owner', async () => {
			adoptionFindOneByOrFail.mockResolvedValue(adoption);
			petFindOneByOrFail.mockResolvedValue(adoption.pet);
			checkPetOwner.mockRejectedValue(new NotOwnerError);

			const controller = new AdoptionController(settings);
			const result = controller.delete(adoption.id);

			await expect(result).rejects.toThrow(NotOwnerError);

			expect(adoptionFindOneByOrFail).toHaveBeenCalledTimes(1);
			expect(petFindOneByOrFail).toHaveBeenCalledTimes(1);
			expect(checkPetOwner).toHaveBeenCalledTimes(1);
			expect(transaction).toHaveBeenCalledTimes(0);
		});

		it('should throw EntityNotFoundError for not-existent adoption', async () => {
			adoptionFindOneByOrFail.mockRejectedValue(new EntityNotFoundError(Adoption, 'id=id'));

			const controller = new AdoptionController(settings);
			const result = controller.delete(adoption.id);

			await expect(result).rejects.toThrow(EntityNotFoundError);

			expect(adoptionFindOneByOrFail).toHaveBeenCalledTimes(1);
			expect(petFindOneByOrFail).toHaveBeenCalledTimes(0);
			expect(transaction).toHaveBeenCalledTimes(0);
			expect(checkPetOwner).toHaveBeenCalledTimes(0);
		});

		it('should throw EntityNotFoundError for not-existent pet', async () => {
			adoptionFindOneByOrFail.mockResolvedValue(adoption);
			petFindOneByOrFail.mockRejectedValue(new EntityNotFoundError(Pet, 'id=id'));

			const controller = new AdoptionController(settings);
			const result = controller.delete(adoption.id);

			await expect(result).rejects.toThrow(EntityNotFoundError);

			expect(adoptionFindOneByOrFail).toHaveBeenCalledTimes(1);
			expect(petFindOneByOrFail).toHaveBeenCalledTimes(1);
			expect(transaction).toHaveBeenCalledTimes(0);
			expect(checkPetOwner).toHaveBeenCalledTimes(0);
		});
	});
});
