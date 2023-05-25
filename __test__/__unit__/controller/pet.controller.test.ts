import { randomUUID } from 'crypto';
import PetController from '../../../src/controller/pet.controller';
import { Pet } from '../../../src/entities/Pet';
import * as validations from '../../../src/services/validations';
import { Role } from '../../../src/types/enums';
import { IUserSettings } from '../../../src/types/interfaces';
import { generatePetData, generateShelterData } from '../../utils/generate';
import Controller from '../../../src/controller';
import { getMockRepository } from '../../utils/mocks';
import { EntityNotFoundError } from 'typeorm';
import { IdReplacementError, NotOwnerError } from '../../../src/utils/errors/business.errors';
import { BadRequestError } from '../../../src/utils/errors/http.errors';

describe('Pet Controller', () => {
	let settings: IUserSettings;
	let checkPetOwner: jest.SpyInstance;
	let getRepository: jest.SpyInstance;
	let findOneByOrFail: jest.SpyInstance;
	let superController: jest.SpyInstance;

	beforeEach(() => {
		settings = {
			authenticated: false,
			id: randomUUID(),
			permission: {
				granted: true,
				excluded: undefined,
				included: undefined,
				ownershipRequired: false
			},
			role: Role.ADMIN
		};
		superController = jest.spyOn(Controller.prototype, 'updateAll');
		checkPetOwner = jest.spyOn(validations, 'checkPetOwner');
		findOneByOrFail = jest.spyOn(Pet, 'findOneByOrFail');
		getRepository = getMockRepository();
	});
	
	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('create', () => {

		it('should return ForbiddenError:Owner', async () => {
			const pet = generatePetData() as Pet;

			checkPetOwner.mockRejectedValue(new NotOwnerError());

			settings.permission.ownershipRequired = true;

			const controller = new PetController(settings);

			const result = controller.create(pet);

			await expect(result).rejects.toThrow(NotOwnerError);
			expect(checkPetOwner).toHaveBeenCalled();
		});

		it('should return BADREQUEST:Shelter', async () => {
			const pet = generatePetData() as Pet;

			checkPetOwner.mockRejectedValue(new BadRequestError('Shelter does not exist'));
			
			settings.permission.ownershipRequired = true;

			const controller = new PetController(settings);

			const result = controller.create(pet);

			await expect(result).rejects.toThrow('Shelter does not exist');

			expect(checkPetOwner).toHaveBeenCalled();
		});

		it('should create without shelterId', async () => {
			const {id, shelterId,...pet} = generatePetData();
			
			checkPetOwner.mockResolvedValue(true);

			settings.permission.ownershipRequired = true;

			const controller = new PetController(settings);

			const result = await controller.create(pet as Pet);
			expect(result).toEqual(pet);
			expect(checkPetOwner).toHaveBeenCalled();
			expect(getRepository).toHaveBeenCalledTimes(2);
		});

		it('should create', async () => {
			const {id, ...pet} = generatePetData();

			checkPetOwner.mockResolvedValue(true);
			
			settings.permission.ownershipRequired = true;

			const controller = new PetController(settings);

			const result = await controller.create(pet as Pet);
			expect(result).toEqual(pet);
			expect(checkPetOwner).toHaveBeenCalled();
			expect(getRepository).toHaveBeenCalledTimes(2);
		});
	});

	describe('updateAll', () => {

		it('should throw BadRequest:Id', async () => {
			const pet = generatePetData() as Pet;

			findOneByOrFail.mockResolvedValue(generateShelterData({pet: {id: pet.id}}));
			try{
				const controller = new PetController(settings);
				const result = await controller.updateAll(pet, randomUUID());
			}
			catch(err){
				expect(err).toBeInstanceOf(IdReplacementError);
				expect((err as Error).message).toBe('id replacememt is not allowed');
			}
			finally {
				expect(findOneByOrFail).toHaveBeenCalled();
				expect.assertions(3);
			}

		});

		it('should throw EntityNotFound', async () => {
			const pet = generatePetData() as Pet;

			findOneByOrFail.mockRejectedValue(new EntityNotFoundError(Pet, `id = ${pet.id}`));
			const controller = new PetController(settings);
			const result = controller.updateAll(pet, randomUUID());
			await expect(result).rejects.toThrow(EntityNotFoundError);
			expect(findOneByOrFail).toHaveBeenCalled();

		});

		it('should udpate', async () => {
			const pet = generatePetData();

			superController.mockResolvedValue(pet);

			findOneByOrFail.mockResolvedValue(pet);

			const controller = new PetController(settings);

			const result = await controller.updateAll(pet as Pet, pet.id);
			expect(result).toEqual(pet);
			expect(superController).toHaveBeenCalled();
			expect(findOneByOrFail).toHaveBeenCalled();
		});
	});
});
