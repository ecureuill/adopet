import Controller from '.';
import { dataSource } from '../database/datasource/data-source';
import { Pet } from '../entities/Pet';
import { Shelter } from '../entities/Shelter';
import { checkPetOwner, idReplacememtIsNotAllowed } from '../services/validations';
import { IUserSettings } from '../types/interfaces';

export default class PetController extends Controller<Pet> {

	constructor(userSettings: IUserSettings){
		super(
			{
				userSettings: userSettings, 
				idColumnName: 'id',
				ownerColumnName: 'shelterId',
				alias: 'pet'
			}, 
			Pet,
			[
				{
					property: 'pet.shelter',
					alias: 'shelter',
				},
				{
					property: 'shelter.user',
					alias: 'user'
				}
			],
			checkPetOwner,
			Shelter.getShelterIdByUser
		);
		
	}

	async create(pet: Pet){
		if(this.getOwnerRequired()){
			const result = await checkPetOwner(pet, this.getUserId());
		}

		const repository = dataSource.getRepository(Pet);
		await repository.save(pet);

		return pet;
	}

	async updateAll(entity: Pet, id: string){

		const petEntity = await Pet.findOneByOrFail({id: id});

		if(entity.id === undefined || entity.id === '') 
			entity.id = id;
		
		if(entity.shelterId === undefined || entity.id === '')
			entity.shelterId = petEntity.shelterId;

		idReplacememtIsNotAllowed(entity.shelterId, petEntity.shelterId);

		return super.updateAll(entity, id);
	}

	async updateSome(body: any, id: string){
		
		const pet = await Pet.findOneByOrFail({id : id});

		if(body.id !== undefined)
			idReplacememtIsNotAllowed(body.id, id);
		
		if(body.shelterId !== undefined)
			idReplacememtIsNotAllowed(body.shelterId, pet.shelterId);

		return super.updateSome(body, id);
	}

	async delete(id: string, softdelete?: boolean) {
		return await super.delete(id, true);
	}
} 