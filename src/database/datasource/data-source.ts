import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { dataSouceOptions } from '../../config';

export const dataSource = new DataSource(dataSouceOptions);

// to initialize initial connection with the database, register all entities
// and "synchronize" database schema, call "initialize()" method of a newly created database
// once in your application bootstrap
export const openConnection = async () => {
	await dataSource.initialize()
		.then(() => {
			console.debug('Data Source has been initialized!');
		})
		.catch((error) =>{ 
			console.error('Error during Data Source initialization', error);
		})
		.finally(() => {
			console.debug(dataSource.options);
		});
};

export const closeConnection = () => {
	dataSource.destroy();
};