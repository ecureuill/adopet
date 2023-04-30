import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { router } from '../routers';
import { handleError } from '../middlewares/error-handlers/handlerError';
import { handleTypeORMError } from '../middlewares/error-handlers/handleTypeORMError';
import { handleSchemaError } from '../middlewares/error-handlers/handleSchemaError';

dotenv.config();
export const app = express();

app.use(express.json());

app.use(cors());

app.use(router);

app.use(handleSchemaError);
app.use(handleTypeORMError);
app.use(handleError);


export const startServer = () => app.listen(
	process.env.NODE_ENV === 'test'? process.env.TEST_PORT: process.env.DEV_PORT, 
	()=> {
		console.log(`Server is on! ${process.env.BASE_URL}:${process.env.DEV_PORT}`);
	}
);