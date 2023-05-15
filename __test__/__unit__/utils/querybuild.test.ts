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

	it('should retrieve nothing for [],[]', () =>{
		const selectionCol = getSelectableColumns(Shelter.getRepository(), 'shelter', [], []);

		expect(selectionCol.length).toEqual(0);
	});

	it('should retrieve nothing for undefined, undefined', () =>{
		const selectionCol = getSelectableColumns(Shelter.getRepository(), 'shelter', undefined, undefined);

		expect(selectionCol.length).toEqual(0);
	});

	it('should retrieve nothing for undefined,[]', () =>{
		const selectionCol = getSelectableColumns(Shelter.getRepository(), 'shelter', [], undefined);

		expect(selectionCol.length).toEqual(0);
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

	it('should retrieve all columns for  [], [*, user.*, pets.*]', () =>{
		
		const allcols = [...entityCol, ...petCol, ...userCol];

		const selectionCol2 = getSelectableColumns(Shelter.getRepository(), 'shelter', [], ['*', 'user.*', 'pets.*']);

		expect(selectionCol2.length).toEqual(allcols.length);
		expect(selectionCol2.sort()).toEqual(allcols.sort());

	});

	it('should exclude column [shelter.exclude_column]', () => {
		const allcols = [...entityCol, ...petCol, ...userCol];
		const excludedCol = 'shelter.delete_date';
		const filteredCols = allcols.filter( col => col !== excludedCol);

		const selectionCol = getSelectableColumns(Shelter.getRepository(), 'shelter', [excludedCol]);

		console.debug(filteredCols);
		console.debug(selectionCol);
		expect(selectionCol.length).toEqual(filteredCols.length);

		expect(selectionCol.sort()).toEqual(filteredCols.sort());
	});

	it('should exclude column [random]', () =>{
		const allcols = [...entityCol, ...petCol, ...userCol];
		const excludedCol = allcols[Math.floor(Math.random()*allcols.length)];
		const filteredCols = allcols.filter( col => col !== excludedCol);

		const selectionCol2 = getSelectableColumns(Shelter.getRepository(), 'shelter', [excludedCol]);

		console.debug(excludedCol);
		console.debug(filteredCols);
		console.debug(selectionCol2);
		expect(selectionCol2.length).toEqual(filteredCols.length);

		expect(selectionCol2.sort()).toEqual(filteredCols.sort());
	});


	it('should include column [shelter.exclude_column]', () => {
		const column = 'shelter.delete_date';

		const selectionCol = getSelectableColumns(Shelter.getRepository(), 'shelter', undefined, [column]);

		expect(selectionCol.length).toEqual([column].length);

		expect(selectionCol.sort()).toEqual([column].sort());
	});


	it('should include column [shelter.id]', () => {
		const column = 'shelter.delete_date';

		const selectionCol = getSelectableColumns(Shelter.getRepository(), 'shelter', undefined, [column]);

		expect(selectionCol.length).toEqual([column].length);

		expect(selectionCol.sort()).toEqual([column].sort());
	});
});