import { ObjectLiteral, Repository, SelectQueryBuilder} from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';
import { isPropertiesPermissionMisconfigured } from '../services/permissions';
import createHttpError from 'http-errors';
import { MisconfiguredError } from './errors/code.errors';

export const getRelations = (relations: RelationMetadata[]) => relations.map( relation => relation.propertyName);

const getRelationColumns = (relations: RelationMetadata[], condition: (column: string, relationName: string) => boolean) => {
	return relations.reduce((previous: string[], relation: RelationMetadata) => {
		relation.inverseEntityMetadata.columns.forEach(column =>{
			const columnName = `${relation.propertyName}.${column.propertyName}`;
			if(condition(columnName, relation.propertyName))
				previous.push(columnName);
		});
		
		const subrelation = relation.inverseEntityMetadata.ownRelations.filter(r => r.propertyName === 'user');
		previous.push(...getRelationColumns(subrelation, condition));
	
		return previous;

	}, []);
};

const getEntityColumns = (columns: ColumnMetadata[], alias: string, condition: (column: string) => boolean) => {
	return columns.reduce((previous:string[], current: ColumnMetadata) => {
		const columnName = `${alias}.${current.databaseName}`;
		if(condition(columnName))
			previous.push(columnName);

		return previous;
	}, []);	
};

export const getSelectableColumns = <Entity extends ObjectLiteral>(repository: Repository<Entity>,  alias: string, columnsToExclude?: string[] | undefined, columnsToInclude?: string[] | undefined): string[] => {
	
	let selectOpt: string[] = [];
	
	if(isPropertiesPermissionMisconfigured({excluded: columnsToExclude, included: columnsToInclude}))
		throw new MisconfiguredError('Permissions');

	if(columnsToExclude !== undefined){
		selectOpt = getEntityColumns(repository.metadata.columns, alias, (column => !columnsToExclude.includes(column)));
		selectOpt.push(...getRelationColumns(repository.metadata.ownRelations, (column => !columnsToExclude.includes(column))));	
	}

	if(columnsToInclude !== undefined){
		if(columnsToInclude.includes('*'))
			selectOpt = getEntityColumns(repository.metadata.columns, alias, (column => true));
		else
		{
			selectOpt = getEntityColumns(repository.metadata.columns, alias, (column => columnsToInclude.includes(column)));
		}
		selectOpt.push(...getRelationColumns(repository.metadata.ownRelations, ((column, relation) => {
			if (columnsToInclude.includes(`${relation}.*`)) 
				return true;
			return columnsToInclude.includes(column);
		})));	

	}
	
	return selectOpt;
};

export const isExistsQuery = (query: string) => `CASE WHEN EXISTS(${query}) THEN 1 ELSE 0 END AS "exists"`;

declare module 'typeorm' {
  interface SelectQueryBuilder<Entity> {
	exists<T>(): Promise<boolean>;
	existsOrFail<T>(): Promise<boolean>;
  }
}

SelectQueryBuilder.prototype.exists = async function (): Promise<boolean> {
	const result = await this.select(isExistsQuery(this.getQuery())).where('').take(1).getRawOne();
	return result?.exists == '1';
};