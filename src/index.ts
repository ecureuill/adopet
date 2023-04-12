import express from 'express';
import * as dotenv from 'dotenv';

import { AppDataSource } from './datasource/data-source';

dotenv.config();
const app = express();

AppDataSource.isConnected;

app.listen(process.env.DEV_PORT, ()=> {
	console.log(`Server is on! ${process.env.BASE_URL}:${process.env.DEV_PORT}`);
});