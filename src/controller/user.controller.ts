import { dataSource } from '../database/datasource/data-source';
import { User } from '../entities/User';
import { passwordCompareHash, passwordToHash } from '../services/passwords';
import createError from 'http-errors';
import { createJwtToken } from '../services/tokens';
import { Role } from '../types/enums';
import { IUserSettings } from '../types/interfaces';
import Controller from '.';
import createHttpError from 'http-errors';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

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
		let entity;

		try{
			entity = await User.findOneByOrFail({
				email: email,
			});
		}
		catch (err){
			console.error(err);
			if(err instanceof EntityNotFoundError)
				throw new createError.Unauthorized('Invalid credentials');
			
			throw err;
		}
		
		if(!passwordCompareHash(password, entity.password))
			throw new createError.Unauthorized('Invalid credentials');

		return createJwtToken({id: entity.id, role: entity.role});
	}

	async create(user: User, role: Role = Role.ADMIN) {
		user.password = passwordToHash(user.password);
		user.role = role; 
		
		const repository = dataSource.getRepository(User);
		try{
			await repository.save(user);
		}
		catch (err){
			if(err instanceof QueryFailedError && err.message.startsWith('duplicate key value violates unique constraint'))
				throw new createHttpError.BadRequest('Email already exist');
			throw err;
		}

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