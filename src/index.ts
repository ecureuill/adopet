
import { closeConnection, openConnection } from './database/datasource/data-source';
import { startServer } from './server';

const server = startServer();

server.on('listening', async () => await openConnection() );

server.on('connection', () => console.debug('Hiiii'));

server.on('close', () => closeConnection());