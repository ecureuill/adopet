import { dataSource } from '../database/datasource/data-source';
import { User } from '../entities/User';
import { passwordCompareHash, passwordToHash } from '../services/passwords';
import createError from 'http-errors';
import { createJwtToken } from '../services/tokens';
import { Role } from '../types/enums';
import { IUserSettings } from '../types/interfaces';
import Controller from '.';

export default class UserController extends Controller<User> {
	private static alias = 'user';

	constructor(userSettings: IUserSettings){
		super(
			{
				userSettings: userSettings, 
				idColumnName: 'id',
				ownerColumnName: 'id',
				alias: UserController.alias
			}, 
			User,
		);
	}

	async auth(email: string, password: string){

		const entity = await User.findOneByOrFail({
			email: email,
		});

		if(!passwordCompareHash(password, entity.password))
			throw new createError.Unauthorized('Invalid credentials');

		return createJwtToken({id: entity.id, role: entity.role});
	}

	async create(user: User, role: Role = Role.ADMIN) {
		user.password = passwordToHash(user.password);
		console.debug(user.role);
		user.role = role; 
		
		console.debug(user.role);
		
		const repository = dataSource.getRepository(User);
		await repository.save(user);

		console.debug(`Saved a new user with id ${user.id}`);

		return user;
	}

	async updateAll(entity: User, id: string) {
		entity.password = passwordToHash(entity.password);

		return super.updateAll(entity, id);
	}

	async updateSome(body: object, id: string): Promise<User> {
		const key = 'password' as keyof object;

		if(body[key] !== undefined)
			(body as User).password = passwordToHash(body[key]);

		return super.updateSome(body, id);
	}

	async delete(id: string) {
		return super.delete(id, true);
	}
}