import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';

import { dataSource } from './database/datasource/data-source';
import { router } from './routers';
import { handleError } from './middlewares/error-handlers/handlerError';
import { handleTypeORMError } from './middlewares/error-handlers/handleTypeORMError';
// import { handleSchemaError } from './middlewares/error-handlers/handleSchemaError';

dotenv.config();
export const app = express();

console.debug(`AppDataSource.isConnected ${dataSource.isConnected}`);

app.use(express.json());

app.use(cors());

app.use(router);

// app.use(handleSchemaError);
app.use(handleTypeORMError);
app.use(handleError);

app.listen(process.env.DEV_PORT, ()=> {
	console.log(`Server is on! ${process.env.BASE_URL}:${process.env.DEV_PORT}`);
});