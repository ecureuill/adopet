import { faker } from '@faker-js/faker/locale/pt_BR';
import {passwordCompareHash, passwordToHash} from '../../../src/services/passwords';

describe('passwords', () => {
	it('create a valida hash from password', () => {
		const password = faker.internet.password();

		const hash = passwordToHash(password);

		expect(passwordCompareHash(password, hash)).toBe(true);
	});

	it('fail with wrong password', () => {
		const password = faker.internet.password();

		const hash = passwordToHash(password);

		expect(passwordCompareHash(faker.internet.password(), hash)).toBe(false);
	});
});