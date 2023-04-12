import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';

import { AppDataSource } from './datasource/data-source';
import { router } from './routers';

dotenv.config();
export const app = express();

console.debug(`AppDataSource.isConnected ${AppDataSource.isConnected}`);

app.use(express.json());

app.use(cors());

app.use(router);

app.listen(process.env.DEV_PORT, ()=> {
	console.log(`Server is on! ${process.env.BASE_URL}:${process.env.DEV_PORT}`);
});