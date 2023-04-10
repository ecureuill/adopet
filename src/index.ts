import express from 'express';
import * as dotenv from 'dotenv';

dotenv.config();
const app = express();

app.listen(process.env.DEV_PORT, ()=> {
	console.log('Server is on! http://localhost.com.br:'+process.env.DEV_PORT);
});