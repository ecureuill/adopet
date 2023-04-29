import Controller from '.';
import { dataSource } from '../database/datasource/data-source';
import { Tutor } from '../entities/Tutor';
import { passwordToHash } from '../services/passwords';
import { idReplacememtIsNotAllowed } from '../services/validations';
import { Role } from '../types/enums';
import { IUserSettings } from '../types/interfaces';

export default class TutorController extends Controller<Tutor> {
	private static alias = 'tutor';

	constructor(userSettings: IUserSettings){
		super({
			userSettings: userSettings, 
			idColumnName: 'id',
			ownerColumnName: 'userId',
			alias: TutorController.alias,
		}, 
		Tutor,
		[
			{
				property: `${TutorController.alias}.user`,
				alias: 'user',
			}
		]);
	}

	async create(tutor: Tutor){

		tutor.user.password = passwordToHash(tutor.user.password);
		tutor.user.role = Role.TUTOR;

		const repository = dataSource.getRepository(Tutor);
		await repository.save(tutor);

		console.debug(`Saved a new user with id ${tutor.id}`);

		return tutor;
	}

	async updateAll(entity: Tutor, id: string) {
		
		const userEntity = await Tutor.findOneByOrFail({id : id});


		if(entity.id === undefined || entity.id === '') 
			entity.id = id;
		
		if(entity.userId === undefined || entity.id === '')
			entity.userId = userEntity.userId;

		if(entity.user !== undefined)
			entity.user.id = userEntity.userId;

		if(entity.user?.password !== undefined)
			entity.user.password = passwordToHash(entity.user.password);

		idReplacememtIsNotAllowed(entity.userId, userEntity.userId);
		idReplacememtIsNotAllowed(entity.user.id, userEntity.userId);


		return super.updateAll(entity, id);	
	}

	async updateSome(body: object, id: string) {
		
		if((body as Tutor).user?.password !== undefined)
			(body as Tutor).user.password = passwordToHash((body as Tutor).user.password);

		return super.updateSome(body, id);
	}

	async delete(id: string) {
		return super.delete(id, true);
	}
} 