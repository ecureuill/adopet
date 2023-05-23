import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { DataSource, EntityManager, TypeORMError } from 'typeorm';

export const getMockResponse = (): Partial<Response> => {
	return {
		locals: {},
		status: jest.fn().mockReturnThis(),
		json: jest.fn().mockReturnThis(),
		send: jest.fn().mockReturnThis()
	};
};

export const getMockRequest = () : Partial<Request> => {
	return {
		params:{},
		headers:{},
		body:{}
	};
};

type mockOptions = {
	method: 'save'| 'getOneOrFail', 
	value?: Error | any, 
	rejected?: boolean
};
export const getMockRepository = (...options: mockOptions[]) => {
	return jest.spyOn(DataSource.prototype, 'getRepository').mockImplementation(() => {
		const original = jest.requireActual('typeorm');
		return {
			...original,
			save: jest.fn().mockImplementation((entity: any) => {

				const saveopt = options.find(opt => opt.method === 'save');

				if(saveopt !== undefined && saveopt.rejected !== undefined &&saveopt.rejected === true)
					return Promise.reject(saveopt.value);

				if(saveopt !== undefined && saveopt.rejected !== undefined &&saveopt.rejected === false)
					return Promise.resolve(saveopt.value);

				if(entity.email === 'already-existed@mail.com')
					return Promise.reject(new TypeORMError('not unique email'));

				//create
				if(entity.id === undefined){
					entity.id = randomUUID();
				}

				//tutor or shelter
				if(entity.user !== undefined && entity.userId === undefined){
					const userId = randomUUID();
					entity = {
						...entity,
						user: { ...entity.user, id: userId},
						userid: userId
					};
				}
				return Promise.resolve(entity);	
			}),
			createQueryBuilder: jest.fn().mockImplementation(() => {
				return {
					select: jest.fn().mockReturnThis(),
					where: jest.fn().mockReturnThis(),
					from: jest.fn().mockReturnThis(),
					getOneOrFail: jest.fn().mockImplementation(() => {
						const saveopt = options.find(opt => opt.method === 'getOneOrFail');

						if(saveopt !== undefined && saveopt.rejected !== undefined &&saveopt.rejected === true)
							return Promise.reject(saveopt.value);

						if(saveopt !== undefined)
							return Promise.resolve(saveopt.value);

						throw new Error('missing option parameter for getOneOrFail');
					}),
					// getMany: jest.fn().mockResolvedValue(expected) as unknown,
				};
			}),
			softRemove: jest.fn().mockImplementation((entity: any) => {
				return entity;
			}),
			remove: jest.fn().mockImplementation((entity: any) => {
				return entity;
			})
		};
	});
};