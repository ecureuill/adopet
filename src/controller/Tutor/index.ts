import { EntityNotFoundError } from 'typeorm';
import { AppDataSource } from '../../datasource/data-source';
import { Tutor } from '../../entity/Tutors';

interface Variant {
	[key: string]: string | Buffer;
}


export default class TutorController {
	
	async getAll(){
		const repository = AppDataSource.getRepository(Tutor);

		console.debug('Loading all tutors from database');
		const [entities, count] = await repository.findAndCount();
		console.debug(entities);
		console.debug(`count ${count}`);

		return { entities, count };
	}

	async getOneById(id: string){

		const repository = AppDataSource.getRepository(Tutor);

		console.debug('Loading one tutor from database');
		const entity = await repository.findOneBy({id: id});

		return entity;
	}

	async create(name: string, email: string, password: string){
		const tutor = new Tutor();
		tutor.name = name;
		tutor.email = email;
		tutor.password = password;


		const repository = AppDataSource.getRepository(Tutor);
		await repository.save(tutor);

		console.debug(`Saved a new user with id ${tutor.id}`);

		return tutor;
	}

	async updateAll(tutor: Tutor, id: string){
		const repository = AppDataSource.getRepository(Tutor);
	
		const exist = await repository.exist({where: {id: id}});

		if(!exist)
			throw new EntityNotFoundError(Tutor, {id: id});
		
		tutor.id = id;

		await repository.save(tutor);
	
		console.debug(`update user ${tutor.id}`);

		return tutor;
	}


	async updateSome(body: object, id: string){
		const repository = AppDataSource.getRepository(Tutor);
		
		const  tutor = await repository.findOneByOrFail({id: id});
		
		for (const key of Object.keys(body)) {
			(tutor as unknown as Variant)[key] = (body as Variant)[key];
		}

		console.debug(tutor);
		
		await repository.save(tutor);
	
		console.debug(`update user ${tutor.id}`);

		return tutor;
	}

	async delete(id: string){
		
		const repository = AppDataSource.getRepository(Tutor);

		const tutor = await repository.findOneByOrFail({id: id});
	
		await repository.remove(tutor);
		
		console.debug(`delete user ${tutor.id}`);
	}
} 