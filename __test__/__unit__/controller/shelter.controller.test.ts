import { randomUUID } from 'crypto';
import createHttpError from 'http-errors';
import { EntityNotFoundError } from 'typeorm';
import Controller from '../../../src/controller';
import ShelterController from '../../../src/controller/shelter.controller';
import { Shelter } from '../../../src/entities/Shelter';
import { User } from '../../../src/entities/User';
import { passwordCompareHash } from '../../../src/services/passwords';
import { Role } from '../../../src/types/enums';
import { IUserSettings } from '../../../src/types/interfaces';
import { clone } from '../../../src/utils';
import { generateShelterData } from '../../utils/generate';
import { getMockRepository } from '../../utils/mocks';
import { Pet } from '../../../src/entities/Pet';
import * as validations from '../../../src/services/validations';

describe('Shelter Controller', () => {
	let settings: IUserSettings;
	let getRepository: jest.SpyInstance;

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
		getRepository = getMockRepository();
	});
	
	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('create', () => {
		it('should create', async () => {
			const {id, userId, pets, ...shelter} = generateShelterData();
			const {id: idUser, role, ...user } = shelter.user;
			shelter.user = user as User;
			const shelterClone: Shelter = clone(shelter);

			const controller = new ShelterController(settings);
			const result = await controller.create(shelter as Shelter);
			
			expect(passwordCompareHash(shelterClone.user.password, result.user.password)).toBe(true);

			const {password, ...expected} = shelterClone.user;
			const {password: psw, ...received} = result.user;

			expect(received).toMatchObject(expected);
			expect(getRepository).toHaveBeenCalledTimes(2);
		});
	});

	describe('updateAll', () => {
		let findOneByOrFail: jest.SpyInstance;

		beforeEach(() => {
			findOneByOrFail = jest.spyOn(Shelter, 'findOneByOrFail');
		});

		it('should throw BadRequest:Id', async () => {
			const shelter = generateShelterData() as Shelter;

			findOneByOrFail.mockReturnValue(Promise.resolve(generateShelterData({id: shelter.id})));

			try{
				const controller = new ShelterController(settings);
				const result = await controller.updateAll(shelter, randomUUID());
			}
			catch(err){
				expect(err).toBeInstanceOf(createHttpError.BadRequest);
				expect((err as Error).message).toBe('id replacememt is not allowed');
			}
			finally {
				expect(findOneByOrFail).toHaveBeenCalled();
				expect.assertions(3);
			}

		});

		it('should throw EntityNotFound', async () => {
			const shelter = generateShelterData() as Shelter;

			findOneByOrFail.mockReturnValue(Promise.reject(new EntityNotFoundError(Shelter, `id = ${shelter.id}`)));
			const controller = new ShelterController(settings);
			const result = controller.updateAll(shelter, randomUUID());
			await expect(result).rejects.toThrow(EntityNotFoundError);
			expect(findOneByOrFail).toHaveBeenCalled();

		});

		it('should udpate', async () => {
			const shelter = generateShelterData();
			const superController = jest.spyOn(Controller.prototype, 'updateAll').mockReturnValue(Promise.resolve(shelter));

			findOneByOrFail.mockReturnValue(Promise.resolve(shelter));

			const controller = new ShelterController(settings);

			const result = await controller.updateAll(shelter as Shelter, shelter.id);

			expect(result).toEqual(shelter);
			expect(superController).toHaveBeenCalled();
			expect(findOneByOrFail).toHaveBeenCalled();
		});
	});

	describe('updateSome', () => {
		it('should udpate', async () => {
			const shelter = generateShelterData();
			const superController = jest.spyOn(Controller.prototype, 'updateSome').mockReturnValue(Promise.resolve(shelter));

			const controller = new ShelterController(settings);

			const result = await controller.updateSome(shelter as Shelter, shelter.id);
			
			expect(result).toEqual(shelter);
			expect(superController).toHaveBeenCalled();
		});
	});
});
