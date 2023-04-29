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
				}
			],
			checkPetOwner,
			Shelter.getShelterIdByUser
		);
		
	}

	async create(pet: Pet){
		console.debug('create');
		if(this.getOwnerRequired()){
			console.debug('ownershipRequired');

			const result = await checkPetOwner(pet, this.getUserId());
			console.log(result);
		}

		const repository = dataSource.getRepository(Pet);
		await repository.save(pet);

		console.debug(`Saved a new pet with id ${pet.id}`);

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
} 