import * as dotenv from 'dotenv-safe';
import { Secret, SignOptions, VerifyOptions } from 'jsonwebtoken';
import { DataSourceOptions } from 'typeorm';

dotenv.config({
	example: '.env.template',
	allowEmptyValues: false,
});

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

export const jwtSecret: Secret = process.env.SECRET || '';

export const jwtSignOptions: SignOptions = {
	algorithm: 'HS256',
	expiresIn: '1h',
};

export const jwtVerifyOptions: VerifyOptions = {
	algorithms: ['HS256'],
};