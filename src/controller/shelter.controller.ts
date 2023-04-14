import { EntityNotFoundError } from 'typeorm';
import { dataSource } from '../database/datasource/data-source';
import { Shelter } from '../entities/Shelter';
import { Variant } from '../utils';

export default class ShelterController {
	
	async getAll(){
		const repository = dataSource.getRepository(Shelter);

		console.debug('Loading all shelters from database');
		const [entities, count] = await repository
			.createQueryBuilder('shelter')
			.leftJoinAndSelect('shelter.pets', 'pets', 'pets.adopted = :isAdopted', {isAdopted: false})
			.getManyAndCount();

		console.debug(entities);
		console.debug(`count ${count}`);

		return { entities, count };
	}

	async getOneById(id: string){

		const repository = dataSource.getRepository(Shelter);

		console.debug('Loading one shelter from database');
		const entity = await repository
			.createQueryBuilder('shelter')
			.leftJoinAndSelect('shelter.pets', 'pets', 'pets.adopted = :isAdopted', {isAdopted: false})
			.where({ id: id})
			.getOneOrFail();

		return entity;
	}

	async create(shelter: Shelter){

		const repository = dataSource.getRepository(Shelter);
		await repository.save(shelter);

		console.debug(`Saved a new user with id ${shelter.id}`);

		return shelter;
	}

	async updateAll(shelter: Shelter, id: string){
		const repository = dataSource.getRepository(Shelter);
	
		const exist = await repository.exist({where: {id: id}});

		if(!exist)
			throw new EntityNotFoundError(Shelter, {id: id});

		await repository.save(shelter);
	
		console.debug(`update user ${shelter.id}`);

		return shelter;
	}

	async updateSome(body: object, id: string){
		const repository = dataSource.getRepository(Shelter);
		
		const  shelter = await repository.findOneByOrFail({id: id});
		
		for (const key of Object.keys(body)) {
			(shelter as unknown as Variant)[key] = (body as Variant)[key];
		}

		console.debug(shelter);
		
		await repository.save(shelter);
	
		console.debug(`update user ${shelter.id}`);

		return shelter;
	}

	async delete(id: string){
		
		const repository = dataSource.getRepository(Shelter);

		const shelter = await repository.findOneByOrFail({id: id});
	
		await repository.remove(shelter);
		
		console.debug(`delete user ${shelter.id}`);
	}
} 