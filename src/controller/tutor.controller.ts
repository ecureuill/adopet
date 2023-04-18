import { EntityNotFoundError } from 'typeorm';
import { dataSource } from '../database/datasource/data-source';
import { Tutor } from '../entities/Tutor';
import { Variant } from '../utils';
import { idReplacememtIsNotAllowed } from '../services/validations';

export default class TutorController {
	
	async getAll(){
		const repository = dataSource.getRepository(Tutor);

		console.debug('Loading all tutors from database');
		const [entities, count] = await repository.findAndCount();
		console.debug(entities);
		console.debug(`count ${count}`);

		return { entities, count };
	}

	async getOneById(id: string){

		const repository = dataSource.getRepository(Tutor);

		console.debug('Loading one tutor from database');
		const entity = await repository.findOneByOrFail({id: id});

		return entity;
	}

	async create(tutor: Tutor){

		const repository = dataSource.getRepository(Tutor);
		await repository.save(tutor);

		console.debug(`Saved a new user with id ${tutor.id}`);

		return tutor;
	}

	async updateAll(tutor: Tutor, id: string){
		const repository = dataSource.getRepository(Tutor);
	
		const exist = await repository.exist({where: {id: id}});

		idReplacememtIsNotAllowed(tutor.id, id);

		if(!exist)
			throw new EntityNotFoundError(Tutor, {id: id});

		await repository.save(tutor);
	
		console.debug(`update user ${tutor.id}`);

		return tutor;
	}


	async updateSome(body: object, id: string){
		const repository = dataSource.getRepository(Tutor);
		
		const  tutor = await repository.findOneByOrFail({id: id});
		
		for (const key of Object.keys(body)) {
			(tutor as unknown as Variant)[key] = (body as Variant)[key];
		}

		idReplacememtIsNotAllowed(tutor.id, id);

		console.debug(tutor);
		
		await repository.save(tutor);
	
		console.debug(`update user ${tutor.id}`);

		return tutor;
	}

	async delete(id: string){
		
		const repository = dataSource.getRepository(Tutor);

		const tutor = await repository.findOneByOrFail({id: id});
	
		await repository.remove(tutor);
		
		console.debug(`delete user ${tutor.id}`);
	}
} 