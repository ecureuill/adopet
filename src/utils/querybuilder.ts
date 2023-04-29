import { ObjectLiteral, Repository, SelectQueryBuilder} from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';

export const getRelations = (relations: RelationMetadata[]) => relations.map( relation => relation.propertyName);

const getRelationColumns = (relations: RelationMetadata[], condition: (column: string, relationName: string) => boolean) => {
	return relations.reduce((previous: string[], relation: RelationMetadata) => {
		relation.inverseEntityMetadata.columns.forEach(column =>{
			const columnName = `${relation.propertyName}.${column.propertyName}`;
			if(condition(columnName, relation.propertyName))
				previous.push(columnName);
		});

		return previous;

	}, []);
};

const getEntityColumns = (columns: ColumnMetadata[], alias: string, condition: (column: string) => boolean) => {
	return columns.reduce((previous:string[], current: ColumnMetadata) => {
		if(condition(current.databaseName))
			previous.push(`${alias}.${current.databaseName}`);

		return previous;
	}, []);	
};

export const getSelectableColumns = <Entity extends ObjectLiteral>(repository: Repository<Entity>,  alias: string, columnsToExclude?: string[] | undefined, columnsToInclude?: string[] | undefined): string[] => {
	
	let selectOpt: string[] = [];
	
	console.debug('queryBuilder');

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
	
	console.debug(selectOpt);

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