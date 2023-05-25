import Controller from '.';
import { dataSource } from '../database/datasource/data-source';
import { Adoption } from '../entities/Adoption';
import { Pet } from '../entities/Pet';
import { Shelter } from '../entities/Shelter';
import { Tutor } from '../entities/Tutor';
import { checkPetOwner, isOwnerOrFail } from '../services/validations';
import { IUserSettings } from '../types/interfaces';
import { AdoptionError } from '../utils/errors/business.errors';

export default class AdoptionController extends Controller<Adoption> {
	static alias = 'adoption';

	constructor(userSettings: IUserSettings){
		super({
			userSettings: userSettings, 
			idColumnName: 'id',
			ownerColumnName: 'shelterId',
			alias: AdoptionController.alias
		},
		Adoption, 
		[
			{
				property: `${AdoptionController.alias}.pet`,
				alias: 'pet', 
			},
			{
				property: `${AdoptionController.alias}.tutor`,
				alias: 'tutor', 
			},
		], 
		async (entity: Adoption, userId: string) => {
			const shelter = await Shelter.findOneByOrFail({id: entity.shelterId});
			return isOwnerOrFail(shelter.userId, userId);
		},
		async (userId) => {
			return (await Shelter.getShelterIdByUser(userId));

		}
		);
	}
	
	async create(body: Partial<Adoption>): Promise<Adoption>{

		const adopted = await Adoption.findOneBy({petId: body.petId});
		if(adopted !== null)
			throw new AdoptionError();

		const pet = await Pet.findOneByOrFail({id: body.petId});
		const tutor = await Tutor.findOneByOrFail({id: body.tutorId});

		if(super.getUserSettings().permission.ownershipRequired)
			await checkPetOwner(pet, super.getUserId());

		const adoption = new Adoption();
		adoption.petId = pet.id;
		adoption.shelterId = pet.shelterId;
		adoption.tutorId = tutor.id;
		pet.adopted = true;
		adoption.pet = pet;
		
		return await Adoption.save(adoption);
	}

	async delete(id: string, softdelete?: boolean): Promise<Adoption> {
		const adoption = await Adoption.findOneByOrFail({id: id});
		const pet = await Pet.findOneByOrFail({id: adoption.petId});

		if(super.getUserSettings().permission.ownershipRequired)
			await checkPetOwner(pet, super.getUserId());

		pet.adopted = false;

		await dataSource.transaction(async (trans) => {
			adoption.pet = await trans.save(pet);
			adoption.delete_date = (await trans.softRemove(adoption)).delete_date;
		});

		return adoption;
	}
}