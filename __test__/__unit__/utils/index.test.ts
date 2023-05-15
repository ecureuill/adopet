import { Shelter } from '../../../src/entities/Shelter';
import { assignProperties } from '../../../src/utils';
import { generateShelterData } from '../../utils/generate';

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

		const shelter = assignProperties(body, new Shelter());

		expect(shelter).toMatchObject(body as Shelter);
	});
});