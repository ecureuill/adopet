import { faker } from '@faker-js/faker/locale/pt_BR';
import { randomUUID } from 'crypto';
import { EntityNotFoundError, TypeORMError } from 'typeorm';
import Controller from '../../../src/controller';
import UserController from '../../../src/controller/user.controller';
import { User } from '../../../src/entities/User';
import { passwordToHash } from '../../../src/services/passwords';
import { verifyJwtToken } from '../../../src/services/tokens';
import { Role } from '../../../src/types/enums';
import { IUserSettings } from '../../../src/types/interfaces';
import { generateUserData } from '../../utils/generate';
import { getMockRepository } from '../../utils/mocks';
import { SignInLoginError } from '../../../src/utils/errors/business.errors';

describe('User Controller', () => {
	let settings: IUserSettings;
	let getRepository: jest.SpyInstance;
	let findOneByOrFail: jest.SpyInstance;

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

		findOneByOrFail = jest.spyOn(User, 'findOneByOrFail');
	});
	
	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('auth', () => {
		it('should authenticate', async () => {
			const email = faker.internet.email();
			const password = faker.internet.password();

			findOneByOrFail.mockResolvedValue( generateUserData({email: email, password: passwordToHash(password)}));

			const controller = new UserController(settings);
			const result = await controller.auth(email, password);
			
			expect(() => verifyJwtToken(result)).not.toThrow();
			expect(findOneByOrFail).toBeCalled();

		});

		it('should not authenticate: e-mail', async () => {
			const email = faker.internet.email();
			const password = faker.internet.password();

			findOneByOrFail.mockRejectedValue(new EntityNotFoundError(User, 'email'));

			const controller = new UserController(settings);
			const result = controller.auth(email, password);
			
			await expect(result).rejects.toThrow(SignInLoginError);
			expect(findOneByOrFail).toBeCalled();

		});

		it('should not authenticate: password', async () => {
			const email = faker.internet.email();
			const password = faker.internet.password();

			findOneByOrFail.mockResolvedValue( generateUserData({email: email, password: passwordToHash(faker.internet.password())}));

			const controller = new UserController(settings);
			const result = controller.auth(email, password);
			
			await expect(result).rejects.toThrow(SignInLoginError);
			expect(findOneByOrFail).toBeCalled();

		});
	});

	describe('create', () => {
		it('should create', async () => {
			const body = {
				name: faker.name.fullName(),
				email: faker.internet.email(),
				password: faker.internet.password(),
			};

			const controller = new UserController(settings);
			const result = await controller.create(body as User);
			
			expect(result).toMatchObject(body);
			expect(getRepository).toBeCalledTimes(2);

		});

		it('should not create: e-mail', async () => {
			const body = {
				name: faker.name.fullName(),
				email: 'already-existed@mail.com',
				password: faker.internet.password(),
			};

			const controller = new UserController(settings);
			const result = controller.create(body as User);
			
			await expect(result).rejects.toThrow(TypeORMError);
			expect(getRepository).toBeCalledTimes(2);

		});
	});

	describe('updateAll', () => {

		it('should udpate', async () => {
			const user = generateUserData();
			const superController = jest.spyOn(Controller.prototype, 'updateAll').mockReturnValue(Promise.resolve(user));

			const controller = new UserController(settings);

			const result = await controller.updateAll(user as User, user.id);

			expect(result).toEqual(user);
			expect(superController).toHaveBeenCalled();
		});
	});

	describe('updateSome', () => {

		it('should udpate', async () => {

			const user = {
				password: faker.internet.password(),
				city: faker.address.cityName()
			} as User;

			const superController = jest.spyOn(Controller.prototype, 'updateSome').mockReturnValue(Promise.resolve(user));

			const controller = new UserController(settings);

			const result = await controller.updateSome(user as User, user.id);
			
			expect(result).toEqual(user);
			expect(superController).toHaveBeenCalled();
		});
	});

	describe('delete', () => {
		it('should delete', async () => {
			const superController = jest.spyOn(Controller.prototype, 'delete').mockReturnValue(Promise.resolve(generateUserData({ id: randomUUID(), delete_date: Date.toString()})));

			const controller = new UserController(settings);
			await controller.delete(randomUUID());

			expect(superController).toHaveBeenCalled();
		});
	});
});
