import { checkAllIncluded, checkGrant, getPermission, permissions } from '../../../src/services/permissions';
import { Role } from '../../../src/types/enums';
import { IActionPermission } from '../../../src/types/interfaces';
import { Resources } from '../../../src/utils/consts';

describe('permission by Role', () =>{
	const permissions_ADM: IActionPermission = {
		action: 'crud',
		roles: [Role.ADMIN],
		ownership: false,
	};

	it('Should grant permission only to Admin', () => {
		let grant = checkGrant(permissions_ADM, Role.ADMIN);

		expect(grant).toEqual({
			granted: true,
			ownershipRequired: false,
			...permissions_ADM.attributes
		});

		grant = checkGrant(permissions_ADM, Role.TUTOR);

		expect(grant).toEqual({granted: false});

		grant = checkGrant(permissions_ADM, Role.SHELTER);

		expect(grant).toEqual({granted: false});

		grant = checkGrant(permissions_ADM);

		expect(grant).toEqual({granted: false});
	});

	const permissions_NONE: IActionPermission = {
		action: 'read',
		roles: 'NONE',
		ownership: false,
	};

	it('Should grant permission to all Roles and No-Role', () => {
		let grant = checkGrant(permissions_NONE, Role.ADMIN);

		expect(grant).toEqual({
			granted: true,
			ownershipRequired: false,
			...permissions_NONE.attributes
		});
		
		grant = checkGrant(permissions_NONE, Role.TUTOR);

		expect(grant).toEqual({
			granted: true,
			ownershipRequired: false,
			...permissions_NONE.attributes
		});

		grant = checkGrant(permissions_NONE, Role.SHELTER);

		expect(grant).toEqual({
			granted: true,
			ownershipRequired: false,
			...permissions_NONE.attributes
		});

		grant = checkGrant(permissions_NONE);

		expect(grant).toEqual({
			granted: true,
			ownershipRequired: false,
			...permissions_NONE.attributes
		});
	});

	const permissions_TUTOR_SHELTER: IActionPermission = {
		action: 'update',
		roles: [Role.SHELTER, Role.TUTOR],
		ownership: true,
	};

	it('Should grant permission to SHELTER or TUTOR', () => {
		let grant = checkGrant(permissions_TUTOR_SHELTER, Role.ADMIN);

		expect(grant).toEqual({granted: false});
		
		grant = checkGrant(permissions_TUTOR_SHELTER, Role.TUTOR);

		expect(grant).toEqual({
			granted: true,
			ownershipRequired: true,
			...permissions_TUTOR_SHELTER.attributes
		});

		grant = checkGrant(permissions_TUTOR_SHELTER, Role.SHELTER);

		expect(grant).toEqual({
			granted: true,
			ownershipRequired: true,
			...permissions_TUTOR_SHELTER.attributes
		});

		grant = checkGrant(permissions_TUTOR_SHELTER);

		expect(grant).toEqual({granted: false});
	});


	
});

describe('checkAllIncluded', () => {
	it('should return false for [id]', () => {
		expect(checkAllIncluded(['id'])).toBe(false);
	});

	it('should return false for [*]', () => {
		expect(checkAllIncluded(['*', 'shelter.*', 'id'])).toBe(false);
	});

	it('should return true for [*]', () => {
		expect(checkAllIncluded(['*'])).toBe(true);
	});

	it('should return true for [*]', () => {
		expect(checkAllIncluded(['*', 'shelter.*'])).toBe(true);
	});
});

describe('getPermission', () => {
	it('should return the correct permission', () =>{ 
		expect(getPermission(Resources.PET)).toMatchObject(permissions.pet.permissions);

		expect(getPermission(Resources.SHELTER)).toMatchObject(permissions.shelter.permissions);

		expect(getPermission(Resources.TUTOR)).toMatchObject(permissions.tutor.permissions);

		expect(getPermission(Resources.USER)).toMatchObject(permissions.user.permissions);
	});

	it('should throw for non-existent permission', () => {
		expect(() => getPermission('test' as any)).toThrow('No permission rules for test');
	});
});