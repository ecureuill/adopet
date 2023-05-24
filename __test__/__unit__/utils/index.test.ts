import { faker } from '@faker-js/faker/locale/pt_BR';
import { Shelter } from '../../../src/entities/Shelter';
import { IShelter } from '../../../src/types/schemas';
import { assignProperties } from '../../../src/utils';
import { generatePetData, generateShelterData } from '../../utils/generate';

describe('assignProperties function', () => {
	const INITIAL_OBJECT = {
		a: 'lorem',
		b: 10,
		c: true,
		d: {
			a: 'lorem',
			b: 20,
			c: false
		},
		// e: ['a', 'b', 'c'],
		f: [
			{
				id: 1,
				a: 'lorem',
				b: 20,
				c: false
			},
			{
				id: 2,
				a: 'lorem',
				b: 20,
				c: false
			},
			{
				id: 3,
				a: 'lorem',
				b: 20,
				c: false
			},
		]
	} as const;

	const MODIFICATIONS = {
		a: 'Quis aliquip.',
		d: {
			b: 50,
			d: 'New'
		},
		// e: ['1', '2'],
		f: [
			{
				id: 2,
				c: true
			},
			{
				a: 'new'
			},
			{
				id: 4,
				b: undefined
			}
		]
	} as const;

	it('add or replace attributes', () => {
		const originalObject = INITIAL_OBJECT;
		const modObject = MODIFICATIONS;
		const newObject = assignProperties(modObject, originalObject);

		expect(originalObject).toEqual(INITIAL_OBJECT);
		expect(modObject).toEqual(MODIFICATIONS);
		expect(newObject).toMatchObject({
			a: 'Quis aliquip.',
			b: 10,
			c: true,
			d: {
				a: 'lorem',
				b: 50,
				c: false,
				d: 'New'
			},
			// e: ['1', '2'],
			f: [
				{
					id: 1,
					a: 'lorem',
					b: 20,
					c: false
				},
				{
					id: 2,
					a: 'lorem',
					b: 20,
					c: true
				},
				{
					id: 3,
					a: 'lorem',
					b: 20,
					c: false
				},
				{
					a: 'new'
				},
				{
					id: 4,
					b: undefined
				}
			]
		}
		);
	});

	it('should add all attributes to shelter', () => {

		const body = generateShelterData();

		const shelter: IShelter = {
			id: body.id,
			userId: body.userId,
			inactive: !body.inactive,
			pets: [],
			user: {
				id: body.userId,
				email: faker.internet.email(),
				password: faker.internet.password(),
				city: faker.address.cityName(),
				state: undefined,
				phone: undefined,
				role: body.user.role,
				name: faker.name.fullName(),
			}

		};

		assignProperties(body, shelter);

		expect(shelter).toMatchObject(body as Shelter);
	});

	it('should add all attributes to shelter and keep older pets', () => {

		const body = generateShelterData();
		const shelter: IShelter = {
			id: body.id,
			userId: body.userId,
			inactive: !body.inactive,
			pets: [generatePetData()],
			user: {
				id: body.userId,
				email: faker.internet.email(),
				password: faker.internet.password(),
				city: faker.address.cityName(),
				state: undefined,
				phone: undefined,
				role: body.user.role,
				name: faker.name.fullName(),
			}

		};

		assignProperties(body, shelter);

		const { pets: petsShelter, ...partialShelter} = shelter;
		const { pets: petsBody, ...partialBody} = body;

		expect(partialShelter).toEqual(partialBody);

		petsBody.forEach(pet => {
			expect(petsShelter).toContain(pet);
		});
		
		expect(petsShelter.length-1).toEqual(petsBody.length);
	});
});