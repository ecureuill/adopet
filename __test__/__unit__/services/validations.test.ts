import { faker } from '@faker-js/faker/locale/pt_BR';
import { randomUUID } from 'crypto';
import createHttpError from 'http-errors';
import { Pet } from '../../../src/entities/Pet';
import { Shelter } from '../../../src/entities/Shelter';
import { checkPetOwner, idReplacememtIsNotAllowed, isOwnerOrFail, isPropertyUpdateAllowedOrFail, isPutAllowedOrFail, phoneRegex, stateRegex } from '../../../src/services/validations';
import { Role } from '../../../src/types/enums';
import { IUserSettings } from '../../../src/types/interfaces';
import { IPet, IShelter, IUser } from '../../../src/types/schemas';
import { USER_NOT_AUTHENTICATED } from '../../../src/utils/consts';
import { generatePetData, generateShelterData, generateUserData } from '../../utils/generate';

describe('phoneRegex', () => {
	const regex = RegExp(phoneRegex);
	it('## #.####-####', () => {
		expect(regex.test(faker.phone.number('## #.####-####'))).toEqual(false);
	});

	it('# ####-####', () => {
		expect(regex.test(faker.phone.number('# ####-####'))).toEqual(false);
	});

	it('###########', () => {
		expect(regex.test(faker.phone.number('###########'))).toEqual(true);
	});

	it('##########', () => {
		expect(regex.test(faker.phone.number('##########'))).toEqual(true);
	});

	it('#########', () => {
		expect(regex.test(faker.phone.number('#########'))).toEqual(true);
	});

	it('########', () => {
		expect(regex.test(faker.phone.number('########'))).toEqual(true);
	});

	it('####-####', () => {
		expect(regex.test(faker.phone.number('####-####'))).toEqual(true);
	});

	it('####.####', () => {
		expect(regex.test(faker.phone.number('####.####'))).toEqual(true);
	});

	it('####.#####', () => {
		expect(regex.test(faker.phone.number('####.#####'))).toEqual(false);
	});

	it('+## ## #### ####', () => {
		expect(regex.test(faker.phone.number('+## ## #### ####'))).toEqual(false);
	});
	
	it('aaaa-aaaa', () => {
		expect(regex.test('aaaa-aaaa')).toEqual(false);
	});
});

describe('stateRegex', () => {
	const regex = RegExp(stateRegex);

	it('should match random abbreviation', () => {
		expect(regex.test(faker.address.stateAbbr())).toEqual(true);
	});

	it('should match SP', () => {
		expect(regex.test('SP')).toEqual(true);
	});

	it('should not match SSP', () => {
		expect(regex.test('SSP')).toEqual(false);
	});

	it('should not match S P', () => {
		expect(regex.test('S P')).toEqual(false);
	});

	it('should not match P', () => {
		expect(regex.test(' P')).toEqual(false);
	});

	it('should not match 1P', () => {
		expect(regex.test('1P')).toEqual(false);
	});
});

describe('idReplacememtIsNotAllowed', () => {
	it('Should not throw error', ()=>{
		const id = randomUUID();

		expect(() => idReplacememtIsNotAllowed(id, id)).not.toThrow();
		expect(() => idReplacememtIsNotAllowed(undefined, id)).not.toThrow();
	});

	it('Should throw error', ()=>{
		expect(() => idReplacememtIsNotAllowed(randomUUID(), randomUUID())).toThrow('id replacememt is not allowed');
	});
});

describe('isOwnerOrFail', () =>{
	it('Should not throw error', ()=>{
		const id = randomUUID();
		expect(isOwnerOrFail(id, id)).toEqual(true);
	});

	it('Should throw error', ()=>{
		expect(() => isOwnerOrFail(randomUUID(), randomUUID())).toThrow('Only owner is authorized to perform this action');
	});
});

describe('isPutAllowedOrFail', () =>{
	let userSettings: IUserSettings;

	beforeEach(() => {
		userSettings = {
			id: randomUUID(),
			authenticated: true,
			role: Role.SHELTER,
			permission: {
				granted: true,
				ownershipRequired: false,
				excluded: undefined,
				included: undefined
			}
		};
	});

	it('Should return true', ()=>{

		userSettings.permission.included =  ['*'];

		expect(isPutAllowedOrFail(userSettings)).toEqual(true);
	});

	it('Should throw error for undefined,undefined', ()=>{
		expect(() => isPutAllowedOrFail(userSettings)).toThrow('PUT is not authorized');
	});

	it('Should throw error [id],undefined', ()=>{
		userSettings.permission.included =  ['id'];
		expect(() => isPutAllowedOrFail(userSettings)).toThrow('PUT is not authorized');
	});

	it('Should throw error for undefined,[id]', ()=>{

		userSettings.permission.excluded =  ['id'];

		expect(() => isPutAllowedOrFail(userSettings)).toThrow('PUT is not authorized');
	});

	it('Should throw error undefined,[]', ()=>{

		userSettings.permission.excluded = [];
		expect(() => isPutAllowedOrFail(userSettings)).toThrow('PUT is not authorized');
	});

	it('Should throw error [],undefined', ()=>{

		userSettings.permission.included = [];
		expect(() => isPutAllowedOrFail(userSettings)).toThrow('PUT is not authorized');
	});
});

describe('isPropertyUpdateAllowedOrFail', () =>{
	let userSettings: IUserSettings;
	let shelter: IShelter;

	beforeAll(()=>{
		shelter = generateShelterData();
	});

	beforeEach(() => {
		userSettings = {
			...USER_NOT_AUTHENTICATED,
			permission: {
				granted: true,
				ownershipRequired: false,
				excluded: undefined,
				included: undefined
			}
		};
	});

	it('Should throw for undefined,undefined', () => {
		try{
			isPropertyUpdateAllowedOrFail(shelter, userSettings);
		}
		catch(err){
			expect(err).toBeInstanceOf(createHttpError.Forbidden);
		}
		finally{
			expect.assertions(1);
		}
	});

	it('Should throw for excluded id', () => {
		userSettings.permission.excluded = ['id'];
		expect(() => isPropertyUpdateAllowedOrFail(shelter, userSettings)).toThrow();
	});

	it('Should throw for everything but id', () => {
		userSettings.permission.included = ['id'];
		expect(() => isPropertyUpdateAllowedOrFail(shelter, userSettings)).toThrow();
	});

	it('Should throw for user and pets properties', () => {
		userSettings.permission.included = ['*'];
		expect(() => isPropertyUpdateAllowedOrFail(shelter, userSettings)).toThrow();
	});

	it('Should throw for pets properties', () => {
		userSettings.permission.included = ['*', 'user.*'];
		expect(() => isPropertyUpdateAllowedOrFail(shelter, userSettings)).toThrow();
	});

	it('Should not throw', () => {
		userSettings.permission.included = ['*', 'user.*', 'pets.*'];
		expect(isPropertyUpdateAllowedOrFail(shelter, userSettings)).toEqual(true);
	});
});

describe('checkPetOwner', () =>{
	const user: IUser = generateUserData();
	const shelter: IShelter = generateShelterData({userId: user.id});
	const pet: IPet = generatePetData({shelterId:shelter.id });
	let findOneBy: jest.SpyInstance;

	beforeEach(() => {
		findOneBy = jest.spyOn(Shelter, 'findOneBy').mockResolvedValue(shelter as Shelter);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('Should return true', async () => {
		const result = checkPetOwner(pet as Pet, user.id );
		await expect(result).resolves.toBe(true);
	});

	it('Should throw error: Owner', async () => {
		const result = checkPetOwner(pet as Pet, randomUUID() );
		await expect(result).rejects.toThrow('Only owner is authorized to perform this action');
	});

	it('Should throw error: Shelter', async () => {
		findOneBy.mockRejectedValue(new createHttpError.BadRequest('Shelter does not exist'));

		const result = checkPetOwner(pet as Pet, randomUUID() );
		await expect(result).rejects.toThrow('Shelter does not exist');
	});


});
