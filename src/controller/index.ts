import { ObjectLiteral, ObjectType, Repository, SelectQueryBuilder } from 'typeorm';
import { dataSource } from '../database/datasource/data-source';
import { IJoin, IUserSettings } from '../types/interfaces';
import { getSelectableColumns } from '../utils/querybuilder';
import { idReplacememtIsNotAllowed, isOwnerOrFail, isPropertyUpdateAllowedOrFail, isPutAllowedOrFail } from '../services/validations';
import { assignProperties } from '../utils';

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

	private getQueryBuilder(selectAllEntity = false, selectAllRelations = false): SelectQueryBuilder<TEntity> {
		
		const qb = this.repository.createQueryBuilder(this._alias);
		
		if(selectAllEntity)
			qb.select();
		else 
		{
			const selectOpt = this.getSelection();
			console.debug(selectOpt);
			
			if(selectOpt.length === 0)
				qb.select();
			else 
				qb.select(selectOpt);

		}

		if(this._joinQuery !== undefined){
			console.debug(this._joinQuery);

			if(selectAllRelations)
				this._joinQuery.forEach(join => qb.leftJoinAndSelect(join.property, join.alias, join.condition, join.parametes));
			else
				this._joinQuery.forEach(join => qb.leftJoin(join.property, join.alias, join.condition, join.parametes));

		}
		return qb;
	}

	async getAll() {
		const whereOpt = [];
		
		if(this._userSettings.permission.ownershipRequired)
			whereOpt.push({[this._ownerColumnName]: await this._fnGetOwnerIdByUserId(this._userSettings.id)});

		const qb = this.getQueryBuilder();

		qb.where(whereOpt);

		console.debug('Loading all entities from database');
		console.debug(qb.getSql());
		const [entities, count] = await qb.getManyAndCount();

		console.debug(entities);
		console.debug(`count ${count}`);

		return { count, entities };
	}

	async getOneById(id: string){
		const qb = this.getQueryBuilder()
			.where({[this._idColumnName] : id});

		console.debug('Loading entity from database');
		console.debug(qb.getSql());
		const entity = await qb.getOneOrFail();

		if(this._userSettings.permission.ownershipRequired)
			await this._fnIsOwnerOrFail(entity, this._userSettings.id);
		
		console.debug(entity);
		return entity;
	}

	async updateAll(entity: TEntity, id: string){
		if(this._userSettings.permission.ownershipRequired)
			await this._fnIsOwnerOrFail(entity, this._userSettings.id);

		isPutAllowedOrFail({ permission: this._userSettings.permission } as IUserSettings);

		idReplacememtIsNotAllowed(entity[this._idColumnName], id);
		
		console.debug(`update user ${entity[this._idColumnName]}`);

		return await this.repository.save(entity);
	}

	async updateSome(body: object, id: string){	
		let entity = await this.getQueryBuilder(true, true)
			.where({[this._idColumnName] : id})
			.getOneOrFail();

		if(this._userSettings.permission.ownershipRequired)
			await this._fnIsOwnerOrFail(entity, this._userSettings.id);
	
		idReplacememtIsNotAllowed((body as TEntity).id, id);

		isPropertyUpdateAllowedOrFail(body, {permission: this._userSettings.permission} as IUserSettings);
	
		console.debug(entity);

		entity = assignProperties(body, entity);

		console.debug(entity);
	
		console.debug(`update entity ${entity[this._idColumnName]}`);

		return await this.repository.save(entity);
	}

	async delete(id: string, softdelete = false){
	
		const entity = await this.getQueryBuilder(true, true)
			.where({[this._idColumnName] : id})
			.getOneOrFail();

		console.debug(entity);

		if(this._userSettings.permission.ownershipRequired)
			await this._fnIsOwnerOrFail(entity, this._userSettings.id);
		
		if(softdelete){
			console.debug('attempt to soft-delete');
			return await this.repository.softRemove(entity);
		}
		else
			return await this.repository.remove(entity);
	}
}