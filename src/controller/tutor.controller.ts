import { QueryFailedError } from 'typeorm';
import Controller from '.';
import { dataSource } from '../database/datasource/data-source';
import { Tutor } from '../entities/Tutor';
import { passwordToHash } from '../services/passwords';
import { idReplacememtIsNotAllowed } from '../services/validations';
import { Role } from '../types/enums';
import { IUserSettings } from '../types/interfaces';
import { ITutor, IUser } from '../types/schemas';
import createHttpError from 'http-errors';

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
		try{
			await repository.save(tutor);
			return tutor;
		}
		catch (err){
			if(err instanceof QueryFailedError && err.message.startsWith('duplicate key value violates unique constraint'))
				throw new createHttpError.BadRequest('Email already exist');
			throw err;
		}
	}

	async updateAll(entity: Tutor, id: string) {
		
		const userEntity = await Tutor.findOneByOrFail({id : id});

		if(entity.id === undefined || entity.id === '') 
			entity.id = id;
		
		if(entity.userId === undefined || entity.userId === '')
			entity.userId = userEntity.userId;

		if(entity.user !== undefined && (entity.user.id === undefined || entity.user.id === ''))
			entity.user.id = userEntity.userId;

		if(entity.user?.password !== undefined)
			entity.user.password = passwordToHash(entity.user.password);

		idReplacememtIsNotAllowed(entity.userId, userEntity.userId);
		idReplacememtIsNotAllowed(entity.user.id, userEntity.userId);

		return super.updateAll(entity, id);	
	}

	async updateSome(body: Partial<ITutor>, id: string) {
		
		if((body as Tutor).user?.password !== undefined)
			(body as Tutor).user.password = passwordToHash((body as Tutor).user.password);
		
		const userEntity = await Tutor.findOneByOrFail({id : id});

		if(body.user !== undefined && (body.user as Partial<IUser>).id !== undefined)
			idReplacememtIsNotAllowed(body.user?.id, userEntity.userId);

		if(body.userId !== undefined)
			idReplacememtIsNotAllowed(body.userId, userEntity.userId);

		return super.updateSome(body, id);
	}

	async delete(id: string) {
		return super.delete(id, true);
	}
} 