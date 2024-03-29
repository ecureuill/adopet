import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { router } from '../routers';
import { handleError } from '../middlewares/error-handlers/handlerError';
import { handleTypeORMError } from '../middlewares/error-handlers/handleTypeORMError';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const swaggerUi = require('swagger-ui-express');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const YAML = require('yamljs');


const swaggerDocument = YAML.load('src/openapi/openapi.yml');

dotenv.config();
export const app = express();

app.use(express.json());

app.use(cors());

app.use(router);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(handleTypeORMError);
app.use(handleError);


export const startServer = () => app.listen(
	process.env.NODE_ENV === 'test'? process.env.TEST_PORT: process.env.DEV_PORT, 
	()=> {
		console.log(`Server is on! ${process.env.BASE_URL}:${process.env.DEV_PORT}`);
	}
);