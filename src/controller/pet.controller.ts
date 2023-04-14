import { EntityNotFoundError } from 'typeorm';
import { dataSource } from '../database/datasource/data-source';
import { Pet } from '../entities/Pet';
import { Variant } from '../utils';

export default class PetController {
	
	async getAll(){
		const repository = dataSource.getRepository(Pet);

		console.debug('Loading all pets from database');
		const [entities, count] = await repository.findAndCount();
		console.debug(entities);
		console.debug(`count ${count}`);

		return { entities, count };
	}

	async getOneById(id: string){

		const repository = dataSource.getRepository(Pet);

		console.debug('Loading one pet from database');
		const entity = await repository.findOneByOrFail({id: id});

		return entity;
	}

	async create(pet: Pet){

		const repository = dataSource.getRepository(Pet);
		await repository.save(pet);

		console.debug(`Saved a new user with id ${pet.id}`);

		return pet;
	}

	async updateAll(pet: Pet, id: string){
		const repository = dataSource.getRepository(Pet);
	
		const exist = await repository.exist({where: {id: id}});

		if(!exist)
			throw new EntityNotFoundError(Pet, {id: id});

		await repository.save(pet);
	
		console.debug(`update user ${pet.id}`);

		return pet;
	}


	async updateSome(body: object, id: string){
		const repository = dataSource.getRepository(Pet);
		
		const  pet = await repository.findOneByOrFail({id: id});
		
		for (const key of Object.keys(body)) {
			(pet as unknown as Variant)[key] = (body as Variant)[key];
		}

		console.debug(pet);
		
		await repository.save(pet);
	
		console.debug(`update user ${pet.id}`);

		return pet;
	}

	async delete(id: string){
		
		const repository = dataSource.getRepository(Pet);

		const pet = await repository.findOneByOrFail({id: id});
	
		await repository.remove(pet);
		
		console.debug(`delete user ${pet.id}`);
	}
} 