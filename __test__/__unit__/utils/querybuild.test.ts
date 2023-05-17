import { closeConnection, openConnection } from '../../../src/database/datasource/data-source';
import { Pet } from '../../../src/entities/Pet';
import { Shelter } from '../../../src/entities/Shelter';
import { User } from '../../../src/entities/User';
import { getSelectableColumns } from '../../../src/utils/querybuilder';

let entityCol: string[] = [];
let userCol: string[] = [];
let petCol: string[] = [];

describe('querybuild function', () => {
	beforeAll(async () => {
		await openConnection();

		entityCol = Shelter.getRepository().metadata.columns.map( col => `shelter.${col.databaseName}`);

		userCol = User.getRepository().metadata.columns.map( col => `user.${col.databaseName}`);

		petCol = Pet.getRepository().metadata.columns.map( col => `pets.${col.databaseName}`);
	});
	
	afterAll(() => closeConnection());

	it('should throw for [],[]', () =>{
		expect(() => getSelectableColumns(Shelter.getRepository(), 'shelter', [], [])).toThrow('Permissions are misconfigured');
	});

	it('should throw for undefined, undefined', () =>{
		expect(() => getSelectableColumns(Shelter.getRepository(), 'shelter', undefined, undefined)).toThrow('Permissions are misconfigured');
	});

	it('should retrieve all for undefined,[]', () =>{
		const allcols = [...entityCol, ...petCol, ...userCol];

		const selectionCol = getSelectableColumns(Shelter.getRepository(), 'shelter', [], undefined);

		expect(selectionCol.length).toEqual(allcols.length);
		expect(selectionCol.sort()).toEqual(allcols.sort());
	});

	it('should retrieve nothing for [],undefined', () =>{
		const selectionCol = getSelectableColumns(Shelter.getRepository(), 'shelter', undefined, []);

		expect(selectionCol.length).toEqual(0);
	});

	it('should retrieve all columns for  undefined, [*, user.*, pets.*]', () =>{
		
		const allcols = [...entityCol, ...petCol, ...userCol];
		
		const selectionCol = getSelectableColumns(Shelter.getRepository(), 'shelter', undefined, ['*', 'user.*', 'pets.*']);

		expect(selectionCol.length).toEqual(allcols.length);
		expect(selectionCol.sort()).toEqual(allcols.sort());
	});

	it('should throw for  [], [*, user.*, pets.*]', () =>{
		
		expect(() => getSelectableColumns(Shelter.getRepository(), 'shelter', [], ['*', 'user.*', 'pets.*'])).toThrow('Permissions are misconfigured');

	});

	it('should exclude column [shelter.delete_date]', () => {
		const allcols = [...entityCol, ...petCol, ...userCol];
		const excludedCol = 'shelter.delete_date';
		const filteredCols = allcols.filter( col => col !== excludedCol);

		const selectionCol = getSelectableColumns(Shelter.getRepository(), 'shelter', [excludedCol], undefined);

		expect(selectionCol.length).toEqual(filteredCols.length);

		expect(selectionCol.sort()).toEqual(filteredCols.sort());
	});

	it('should exclude column [user.delete_date]', () => {
		const allcols = [...entityCol, ...petCol, ...userCol];
		const excludedCol = 'user.delete_date';
		
		const filteredCols = allcols.filter( col => col !== excludedCol);

		const selectionCol = getSelectableColumns(Shelter.getRepository(), 'shelter', [excludedCol]);

		expect(selectionCol.length).toEqual(filteredCols.length);

		expect(selectionCol.sort()).toEqual(filteredCols.sort());
	});

	it('should exclude random columns', () =>{
		const allcols = [...entityCol, ...petCol, ...userCol];
		const excludedCols = [allcols[Math.floor(Math.random()*allcols.length)], allcols[Math.floor(Math.random()*allcols.length)], allcols[Math.floor(Math.random()*allcols.length)], allcols[Math.floor(Math.random()*allcols.length)]];

		const filteredCols = allcols.filter( col => ! excludedCols.includes(col));

		const selectionCol2 = getSelectableColumns(Shelter.getRepository(), 'shelter', excludedCols);

		expect(selectionCol2.length).toEqual(filteredCols.length);

		expect(selectionCol2.sort()).toEqual(filteredCols.sort());
	});

	it('should exclude random columns', () =>{
		const allcols = [...entityCol, ...petCol, ...userCol];
		const includedCols = [allcols[Math.floor(Math.random()*allcols.length)], allcols[Math.floor(Math.random()*allcols.length)], allcols[Math.floor(Math.random()*allcols.length)], allcols[Math.floor(Math.random()*allcols.length)]];

		const filteredCols = allcols.filter( col => includedCols.includes(col));

		const selectionCol2 = getSelectableColumns(Shelter.getRepository(), 'shelter', undefined, includedCols);

		expect(selectionCol2.length).toEqual(filteredCols.length);

		expect(selectionCol2.sort()).toEqual(filteredCols.sort());
	});
	
	it('should include column [user.delete_date]', () => {
		const column = 'user.delete_date';

		const selectionCol = getSelectableColumns(Shelter.getRepository(), 'shelter', undefined, [column]);

		expect(selectionCol.length).toEqual([column].length);

		expect(selectionCol.sort()).toEqual([column].sort());
	});

	it('should include column [shelter.delete_date]', () => {
		const column = 'shelter.delete_date';

		const selectionCol = getSelectableColumns(Shelter.getRepository(), 'shelter', undefined, [column]);

		expect(selectionCol.length).toEqual([column].length);

		expect(selectionCol.sort()).toEqual([column].sort());
	});
});