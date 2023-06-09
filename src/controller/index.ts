import { ObjectLiteral, ObjectType, Repository, SelectQueryBuilder } from 'typeorm';
import { PAGINATION } from '../config';
import { dataSource } from '../database/datasource/data-source';
import { Pet } from '../entities/Pet';
import { User } from '../entities/User';
import { idReplacememtIsNotAllowed, isOwnerOrFail, isPropertyUpdateAllowedOrFail, isPutAllowedOrFail } from '../services/validations';
import { IJoin, IUserSettings } from '../types/interfaces';
import { assignProperties } from '../utils';
import { NotImplementedError } from '../utils/errors/code.errors';
import { getSelectableColumns } from '../utils/querybuilder';

export type settings = {
	userSettings: IUserSettings,
	idColumnName: string,
	ownerColumnName: string,
	alias?: string
}

export default class Controller<TEntity extends ObjectLiteral> {

	private _userSettings: IUserSettings;
	private _idColumnName: string;
	private _ownerColumnName: string;
	private _joinQuery: IJoin[] = [];
	private _alias = '';
	private _fnIsOwnerOrFail: ((entity: TEntity, userId: string) => Promise<boolean> )| ((entity: TEntity, userId: string) => boolean);
	private _fnGetOwnerIdByUserId: (userId: string) => Promise<string>;
	private repository: Repository<TEntity>;

	constructor(
		settings: settings, 
		type: ObjectType<TEntity>, 
	);
	constructor(
		settings: settings, 
		type: ObjectType<TEntity>, 
		joinQuery: IJoin[]
	);
	constructor(
		settings: settings, 
		type: ObjectType<TEntity>, 
		fnGetOwnerIdByUserId: (userId: string) => Promise<string>, 
		fnIsOwnerOrFail: (entity: TEntity, userId: string) => Promise<boolean>,
	);
	constructor(
		settings: settings, 
		type: ObjectType<TEntity>, 
		joinQuery: IJoin[],
		fnIsOwnerOrFail: (entity: TEntity, userId: string) => Promise<boolean>,
		fnGetOwnerIdByUserId: (userId: string) => Promise<string>, 
	);
	constructor(		
		settings: settings, 
		type: ObjectType<TEntity>, 
		arg1?: IJoin[] | ( (userId: string) => Promise<string>),
		arg2?: (entity: TEntity, userId: string) => Promise<boolean>,
		arg3?: (userId: string) => Promise<string>
	) 
	{
		this._idColumnName = settings.idColumnName;
		this._ownerColumnName = settings.ownerColumnName;
		this._userSettings = settings.userSettings;
		this.repository = dataSource.getRepository<TEntity>(type);
		this._alias = settings.alias === undefined? this.repository.metadata.name : settings.alias;

		if(arg1 !== undefined && typeof arg1 !== 'function')
			this._joinQuery = arg1;

		if(arg1 !== undefined && typeof arg1 === 'function')
			this._fnGetOwnerIdByUserId = arg1;

		if(arg2 !== undefined)
			this._fnIsOwnerOrFail = arg2;

		if(arg3 !== undefined)
			this._fnGetOwnerIdByUserId = arg3;

		if(this._fnIsOwnerOrFail === undefined)
			this._fnIsOwnerOrFail = ((entity: TEntity, userId: string) => isOwnerOrFail(userId, entity[this._ownerColumnName]));

		if(this._fnGetOwnerIdByUserId === undefined)
			this._fnGetOwnerIdByUserId = (async (userId: string) => userId);
	}

	getRepository(){
		return this.repository;
	}

	getUserSettings(){
		return this._userSettings;
	}

	getIdColumnName(){
		return this._idColumnName;
	}

	getOwnerColumnName(){
		return this._ownerColumnName;
	}

	getAlias(){
		return this._alias;
	}

	getJoinQuery(){
		return this._joinQuery;
	}

	getFnIsOwnerOrFail(){
		return this._fnIsOwnerOrFail;
	}

	getFnGetOwnerIdByUserId(){
		return this._fnGetOwnerIdByUserId;
	}

	protected getOwnerRequired(){
		return this._userSettings.permission.ownershipRequired;
	}

	protected getUserId(){
		return this._userSettings.id;

	}

	private getSelection(): string[] {
		return getSelectableColumns(this.repository, this._alias, this._userSettings.permission.excluded, this._userSettings.permission.included);
	}

	private getQueryBuilder(selectAllEntity = false, selectAllRelations = false, paginate = false, page?: number): SelectQueryBuilder<TEntity> {
		
		const qb = this.repository.createQueryBuilder(this._alias);
		
		if(selectAllEntity)
			qb.select();
		else 
		{
			const selectOpt = this.getSelection();
			
			if(selectOpt.length === 0)
				qb.select();
			else 
				qb.select(selectOpt);

		}

		if(this._joinQuery !== undefined){

			if(selectAllRelations)
				this._joinQuery.forEach(join => qb.leftJoinAndSelect(join.property, join.alias, join.condition, join.parametes));
			else
				this._joinQuery.forEach(join => qb.leftJoin(join.property, join.alias, join.condition, join.parametes));

			if(paginate){	
				qb.take(10);
				qb.skip(getOffSet(page));
			}

		}
		else
		{
			if(paginate){
				qb.limit(10);
				qb.offset(getOffSet(page));
			}
		}
		return qb;
	}

	async getAll(page?: number) {
		const whereOpt = [];
		
		if(this._userSettings.permission.ownershipRequired)
			whereOpt.push({[this._ownerColumnName]: await this._fnGetOwnerIdByUserId(this._userSettings.id)});

		const qb = this.getQueryBuilder(false, false, true, page? page : 1);

		qb.where(whereOpt);

		const [entities, count] = await qb.getManyAndCount();

		return { count, entities };
	}

	async getOneById(id: string){
		const qb = this.getQueryBuilder()
			.where({[this._idColumnName] : id});

		const entity = await qb.getOneOrFail();

		if(this._userSettings.permission.ownershipRequired)
			await this._fnIsOwnerOrFail(entity, this._userSettings.id);
		
		return entity;
	}

	async updateAll(entity: TEntity, id: string){
		if(this._userSettings.permission.ownershipRequired)
			await this._fnIsOwnerOrFail(entity, this._userSettings.id);

		isPutAllowedOrFail({ permission: this._userSettings.permission } as IUserSettings, this._joinQuery.length);

		idReplacememtIsNotAllowed(entity[this._idColumnName], id);

		return await this.repository.save(entity);
	}

	async updateSome(body: object, id: string, file?: Express.Multer.File){	
		let entity = await this.getQueryBuilder(true, true)
			.where({[this._idColumnName] : id})
			.getOneOrFail();

		if(this._userSettings.permission.ownershipRequired)
			await this._fnIsOwnerOrFail(entity, this._userSettings.id);
	
		idReplacememtIsNotAllowed((body as TEntity).id, id);

		isPropertyUpdateAllowedOrFail(body, {permission: this._userSettings.permission} as IUserSettings, this._joinQuery.length);

		entity = assignProperties(body, entity);
		
		if(file !== undefined){
			if(entity['photo' as keyof TEntity] !== undefined){
				(entity as unknown as Pet).photo = file.buffer;
			}

			else if(entity['user' as keyof TEntity] !== undefined){
				(entity['user' as keyof TEntity] as User).photo = file.buffer;
			}

			else
			{
				throw new NotImplementedError();
			}
		}

		return await this.repository.save(entity);
	}

	async delete(id: string, softdelete = false){
	
		const entity = await this.getQueryBuilder(true, true)
			.where({[this._idColumnName] : id})
			.getOneOrFail();


		if(this._userSettings.permission.ownershipRequired)
			await this._fnIsOwnerOrFail(entity, this._userSettings.id);
		
		if(softdelete)
			return await this.repository.softRemove(entity);
		
		else
			return await this.repository.remove(entity);
	}
}

const getOffSet = (page = 1) => {
	return page * PAGINATION - PAGINATION;
};