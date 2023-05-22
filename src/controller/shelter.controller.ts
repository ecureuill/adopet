import { QueryFailedError } from 'typeorm';
import Controller from '.';
import { dataSource } from '../database/datasource/data-source';
import { Shelter } from '../entities/Shelter';
import { passwordToHash } from '../services/passwords';
import { idReplacememtIsNotAllowed } from '../services/validations';
import { Role } from '../types/enums';
import { IUserSettings } from '../types/interfaces';
import createHttpError from 'http-errors';
import { IShelter, IUser } from '../types/schemas';

export default class ShelterController extends Controller<Shelter>{

	private static alias = 'shelter';

	constructor(userSettings: IUserSettings){
		super(
			{
				userSettings: userSettings, 
				idColumnName: 'id',
				ownerColumnName: 'userId',
				alias: ShelterController.alias
			}, 
			Shelter, 
			[	
				{
					property: `${ShelterController.alias}.pets`,
					alias: 'pets', 
				}, 
				{
					property: `${ShelterController.alias}.user`,
					alias: 'user',
				}
			]
		);
	}

	async create(shelter: Shelter){

		shelter.user.password = passwordToHash(shelter.user.password);
		shelter.user.role = Role.SHELTER;
		
		const repository = dataSource.getRepository(Shelter);
		try{
			await repository.save(shelter);

			return shelter;
		}
		catch (err){
			if(err instanceof QueryFailedError && err.message.startsWith('duplicate key value violates unique constraint'))
				throw new createHttpError.BadRequest('Email already exist');
			throw err;
		}
	}

	async updateAll(entity: Shelter, id: string) {
		
		const shelter = await Shelter.findOneByOrFail({id : id});

		if(entity.id === undefined || entity.id === '') 
			entity.id = id;
		
		if(entity.userId === undefined || entity.userId === '')
			entity.userId = shelter.userId;

		if(entity.user !== undefined && (entity.user.id === undefined || entity.user.id === ''))
			entity.user.id = shelter.userId;

		if(entity.user?.password !== undefined)
			entity.user.password = passwordToHash(entity.user.password);

		idReplacememtIsNotAllowed(entity.userId, shelter.userId);
		idReplacememtIsNotAllowed(entity.user.id, shelter.userId);

		if(entity.pets.some(p => p.shelterId !== shelter.id))
			idReplacememtIsNotAllowed('1', '-1');


		return super.updateAll(entity, id);
	}

	async updateSome(body: Partial<IShelter>, id: string) {
		if((body as Shelter).user?.password !== undefined)
			(body as Shelter).user.password = passwordToHash((body as Shelter).user.password);
		
		const shelter = await Shelter.findOneOrFail({where: {id : id}, relations: {pets: true}});

		if(body.user !== undefined && (body.user as Partial<IUser>).id !== undefined)
			idReplacememtIsNotAllowed(body.user?.id, shelter.userId);

		if(body.userId !== undefined)
			idReplacememtIsNotAllowed(body.userId, shelter.userId);

		if(body.pets !== undefined){
			if(body.pets.some(p => !shelter.pets.some(pet => pet.id === p.id)))
				idReplacememtIsNotAllowed('1', '-1');

			if(body.pets.some(p => p.shelterId !== undefined && p.shelterId  !== shelter.id))
				idReplacememtIsNotAllowed('1', '-1');
		}

		return super.updateSome(body, id);
	}

	async delete(id: string) {

		return super.delete(id, true);
	}
} 

