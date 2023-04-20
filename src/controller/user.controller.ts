import { dataSource } from '../database/datasource/data-source';
import { User } from '../entities/User';
import { passwordCompareHash, passwordToHash } from '../services/passwords';
import createError from 'http-errors';
import { createJwtToken } from '../services/tokens';
import { Role } from '../types/enums';
import { idReplacememtIsNotAllowed } from '../services/validations';
import { EntityNotFoundError } from 'typeorm';
import { Variant } from '../utils';

export default class UserController {
	
	async auth(email: string, password: string){

		const repository = dataSource.getRepository(User);

		console.debug('Loading one user from database');
		const entity = await repository.findOneByOrFail({
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

	async getAll(){
		const repository = dataSource.getRepository(User);

		console.debug('Loading all users from database');
		const [entities, count] = await repository.findAndCount();
		console.debug(entities);
		console.debug(`count ${count}`);

		return { entities, count };
	}

	async getOneById(id: string){

		const repository = dataSource.getRepository(User);

		console.debug('Loading one user from database');
		const entity = await repository.findOneByOrFail({id: id});

		return entity;
	}

	async updateAll(user: User, id: string){
		const repository = dataSource.getRepository(User);
	
		const exist = await repository.exist({where: {id: id}});

		idReplacememtIsNotAllowed(user.id, id);

		if(!exist)
			throw new EntityNotFoundError(User, {id: id});

		await repository.save(user);
	
		console.debug(`update user ${user.id}`);

		return user;
	}

	async updateSome(body: object, id: string){
		const repository = dataSource.getRepository(User);
		
		const  user = await repository.findOneByOrFail({id: id});
		
		for (const key of Object.keys(body)) {
			(user as unknown as Variant)[key] = (body as Variant)[key];
		}

		idReplacememtIsNotAllowed(user.id, id);

		console.debug(user);
		
		await repository.save(user);
	
		console.debug(`update user ${user.id}`);

		return user;
	}

	async delete(id: string){
		
		const repository = dataSource.getRepository(User);

		const user = await repository.findOneByOrFail({id: id});
	
		await repository.remove(user);
		
		console.debug(`delete user ${user.id}`);
	}
}