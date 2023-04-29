import Controller from '.';
import { dataSource } from '../database/datasource/data-source';
import { Shelter } from '../entities/Shelter';
import { passwordToHash } from '../services/passwords';
import { idReplacememtIsNotAllowed } from '../services/validations';
import { Role } from '../types/enums';
import { IUserSettings } from '../types/interfaces';

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
		await repository.save(shelter);

		console.debug(`Saved a new shelter with id ${shelter.id}`);

		return shelter;
	}

	async updateAll(entity: Shelter, id: string) {
		
		const shelter = await Shelter.findOneByOrFail({id : id});

		if(entity.id === undefined || entity.id === '') 
			entity.id = id;
		
		if(entity.userId === undefined || entity.id === '')
			entity.userId = shelter.userId;

		if(entity.user !== undefined)
			entity.user.id = shelter.userId;

		if(entity.user?.password !== undefined)
			entity.user.password = passwordToHash(entity.user.password);

		idReplacememtIsNotAllowed(entity.userId, shelter.userId);
		idReplacememtIsNotAllowed(entity.user.id, shelter.userId);

		return super.updateAll(entity, id);
	}

	async updateSome(body: object, id: string) {
		
		if((body as Shelter).user?.password !== undefined)
			(body as Shelter).user.password = passwordToHash((body as Shelter).user.password);

		return super.updateSome(body, id);
	}

	async delete(id: string) {

		return super.delete(id, true);
	}
} 

