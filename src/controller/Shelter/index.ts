import { EntityNotFoundError } from 'typeorm';
import { AppDataSource } from '../../datasource/data-source';
import { Shelter } from '../../entity/Shelters';

interface Variant {
	[key: string]: string | Buffer;
}

export default class ShelterController {
	
	async getAll(){
		const repository = AppDataSource.getRepository(Shelter);

		console.debug('Loading all shelters from database');
		const [entities, count] = await repository.findAndCount();
		console.debug(entities);
		console.debug(`count ${count}`);

		return { entities, count };
	}

	async getOneById(id: string){

		const repository = AppDataSource.getRepository(Shelter);

		console.debug('Loading one shelter from database');
		const entity = await repository.findOneBy({id: id});

		return entity;
	}

	async create(name: string, email: string, password: string){
		const shelter = new Shelter();
		shelter.name = name;
		shelter.email = email;
		shelter.password = password;

		const repository = AppDataSource.getRepository(Shelter);
		await repository.save(shelter);

		console.log(`Saved a new shelter with id ${shelter.id}`);

		return shelter;
	}

	async updateAll(shelter: Shelter, id: string){
		const repository = AppDataSource.getRepository(Shelter);
	
		const exist = await repository.exist({where: {id: id}});

		if(!exist)
			throw new EntityNotFoundError(Shelter, {id: id});
		
		shelter.id = id;

		await repository.save(shelter);
	
		console.log(`update shelter ${shelter.id}`);

		return shelter;
	}


	async updateSome(body: object, id: string){
		const repository = AppDataSource.getRepository(Shelter);
		const shelter = await repository.findOneByOrFail({id: id});

		for (const key of Object.keys(body)) {
			(shelter as unknown as Variant)[key] = (body as Variant)[key];
		}

		console.debug(shelter);
		
		await repository.save(shelter);
	
		console.log(`update shelter ${shelter.id}`);

		return shelter;
	}

	async delete(id: string){
		
		const repository = AppDataSource.getRepository(Shelter);

		const shelter = await repository.findOneByOrFail({id: id});

		await repository.remove(shelter);
	}
} 