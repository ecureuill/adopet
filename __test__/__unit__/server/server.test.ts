import request from 'supertest';
import { startServer } from '../../../src/server';
import { Server } from 'http';

describe('loading express', () => {
	let server: Server;

	beforeAll(() => server = startServer());
	afterAll(() => server.close());

	it('responds to /ping', async () => {
		const res = await request(server)
			.get('/ping');
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('pong');
	});

	it('404 everything else', async () => {
		const res = await request(server).get('/foo/bar');
		
		expect(res.statusCode).toEqual(404);
	});
});