import { randomUUID } from 'crypto';
import createHttpError from 'http-errors';
import { EntityNotFoundError } from 'typeorm';
import Controller from '../../../src/controller';
import TutorController from '../../../src/controller/tutor.controller';
import { Tutor } from '../../../src/entities/Tutor';
import { User } from '../../../src/entities/User';
import { passwordCompareHash } from '../../../src/services/passwords';
import { Role } from '../../../src/types/enums';
import { IUserSettings } from '../../../src/types/interfaces';
import { clone } from '../../../src/utils';
import { generateTutorData } from '../../utils/generate';
import { getMockRepository } from '../../utils/mocks';

describe('Tutor Controller', () => {
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
			const {id, userId, ...tutor} = generateTutorData();
			const {id: idUser, role, ...user } = tutor.user;
			tutor.user = user as User;
			const tutorClone: Tutor = clone(tutor);

			const controller = new TutorController(settings);
			const result = await controller.create(tutor as Tutor);
			
			expect(passwordCompareHash(tutorClone.user.password, result.user.password)).toBe(true);

			const {password, ...expected} = tutorClone.user;
			const {password: psw, ...received} = result.user;

			expect(received).toMatchObject(expected);
			expect(getRepository).toHaveBeenCalledTimes(2);
		});
	});

	describe('updateAll', () => {
		let findOneByOrFail: jest.SpyInstance;

		beforeEach(() => {
			findOneByOrFail = jest.spyOn(Tutor, 'findOneByOrFail');
		});

		it('should throw BadRequest:Id', async () => {
			const tutor = generateTutorData() as Tutor;

			findOneByOrFail.mockReturnValue(Promise.resolve(generateTutorData({id: tutor.id})));

			try{
				const controller = new TutorController(settings);
				const result = await controller.updateAll(tutor, randomUUID());
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

		it('should throw BadRequest:userId', async () => {
			const tutor = generateTutorData() as Tutor;

			findOneByOrFail.mockReturnValue(Promise.resolve(generateTutorData({id: tutor.id})));


			try{
				const controller = new TutorController(settings);
				const result = await controller.updateAll(tutor, tutor.id);
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
			const tutor = generateTutorData() as Tutor;

			findOneByOrFail.mockReturnValue(Promise.reject(new EntityNotFoundError(Tutor, `id = ${tutor.id}`)));
			const controller = new TutorController(settings);
			const result = controller.updateAll(tutor, randomUUID());
			await expect(result).rejects.toThrow(EntityNotFoundError);
			expect(findOneByOrFail).toHaveBeenCalled();

		});

		it('should udpate', async () => {
			const tutor = generateTutorData();
			const superController = jest.spyOn(Controller.prototype, 'updateAll').mockReturnValue(Promise.resolve(tutor));

			findOneByOrFail.mockReturnValue(Promise.resolve(tutor));

			const controller = new TutorController(settings);

			const result = await controller.updateAll(tutor as Tutor, tutor.id);

			expect(result).toEqual(tutor);
			expect(superController).toHaveBeenCalled();
			expect(findOneByOrFail).toHaveBeenCalled();
		});
	});

	describe('updateSome', () => {

		it('should udpate', async () => {
			const tutor = generateTutorData();
			const superController = jest.spyOn(Controller.prototype, 'updateSome').mockReturnValue(Promise.resolve(tutor));

			const controller = new TutorController(settings);

			const result = await controller.updateSome(tutor as Tutor, tutor.id);
			
			expect(result).toEqual(tutor);
			expect(superController).toHaveBeenCalled();
		});
	});

	describe('delete', () => {
		it('should delete', async () => {
			const tutor = generateTutorData({delete_date: null});

			const superController = jest.spyOn(Controller.prototype, 'delete').mockReturnValue(Promise.resolve({...tutor, delete_date: Date.toString()}));

			const controller = new TutorController(settings);
			await controller.delete(tutor.id);

			expect(superController).toHaveBeenCalled();
		});
	});
});
