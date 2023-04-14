import * as dotenv from 'dotenv';
import { DataSourceOptions } from 'typeorm';

dotenv.config();

export const dataSouceOptions: DataSourceOptions = {	
	type: 'postgres',
	host: process.env.POSTGRES_HOST,
	port: Number(process.env.POSTGRES_PORT),
	username: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
	database: process.env.POSTGRES_DATABASE,
	synchronize: true,
	logging: false,
	entities: ['./src/entities/*.ts'],
	migrations: ['./src/database/migration/*.ts'],
	subscribers: [],
};