import { QueryFailedError } from 'typeorm';
import Controller from '.';
import { dataSource } from '../database/datasource/data-source';
import { Tutor } from '../entities/Tutor';
import { passwordToHash } from '../services/passwords';
import { idReplacememtIsNotAllowed } from '../services/validations';
import { Role } from '../types/enums';
import { IUserSettings } from '../types/interfaces';
import { ITutor, IUser } from '../types/schemas';
import { SignUPEmailError } from '../utils/errors/business.errors';

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
				throw new SignUPEmailError();
			throw err;
		}
	}

	async getOneById(userId: string) {
		const tutor = await Tutor.findOneByOrFail({userId : userId});

		return super.getOneById(tutor.id);    
	}
	
	async updateAll(entity: Tutor, userId: string) {
		
		const tutorEntity = await Tutor.findOneByOrFail({userId : userId});

		if(entity.id === undefined || entity.id === '') 
			entity.id = tutorEntity.id;
		
		if(entity.userId === undefined || entity.userId === '')
			entity.userId = tutorEntity.userId;

		if(entity.user !== undefined && (entity.user.id === undefined || entity.user.id === ''))
			entity.user.id = tutorEntity.userId;

		if(entity.user?.password !== undefined)
			entity.user.password = passwordToHash(entity.user.password);

		idReplacememtIsNotAllowed(entity.userId, tutorEntity.userId);
		idReplacememtIsNotAllowed(entity.user.id, tutorEntity.userId);

		return super.updateAll(entity, tutorEntity.id);	
	}

	async updateSome(body: Partial<ITutor>, userId: string, file?: Express.Multer.File) {
		
		if((body as Tutor).user?.password !== undefined)
			(body as Tutor).user.password = passwordToHash((body as Tutor).user.password);
		
		const tutorEntity = await Tutor.findOneByOrFail({userId : userId});

		if(body.user !== undefined && (body.user as Partial<IUser>).id !== undefined)
			idReplacememtIsNotAllowed(body.user?.id, tutorEntity.userId);

		if(body.userId !== undefined)
			idReplacememtIsNotAllowed(body.userId, tutorEntity.userId);


		return super.updateSome(body, tutorEntity.id, file);
	}

	async delete(userId: string) {
		const tutorEntity = await Tutor.findOneByOrFail({userId : userId});
		return super.delete(tutorEntity.id, true);
	}
} 