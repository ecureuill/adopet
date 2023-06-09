import { NextFunction, Request, Response } from 'express';

import PetController from '../controller/pet.controller';

export default class PetRouter {
	async getAll(request: Request, response: Response, next: NextFunction){
		try{

			const controller = new PetController(response.locals.user);
		
			const { page } = request.query;

			const result = await controller.getAll(Number(page));

			if(result.count === 0)
				return response.status(200).json({mensagem: 'Não encontrado'});

			return response.status(200).json(result);
		}
		catch(error){
			next(error);
		}
	}

	async getOneById(request: Request, response: Response, next: NextFunction){
		try{

			const controller = new PetController(response.locals.user);

			const { id } = request.params;

			const result = await controller.getOneById(id);

			// result.shelter.user = await new UserController(response.locals.user).getOneById(result.shelter.userId);  

			return response.status(200).json(result);
		}
		catch(error){
			next(error);
		}
	}

	async create(request: Request, response: Response, next: NextFunction){
		try{

			const controller = new PetController(response.locals.user);

			const result = await controller.create(request.body);

			return response.status(201).json(result);
		}
		catch(error){
			next(error);
		}
	}

	async updateAll(request: Request, response: Response, next: NextFunction){
		try{

			const controller = new PetController(response.locals.user);

			const { id } = request.params;

			const result = await controller.updateAll(request.body, id);

			return response.status(200).json(result);
		}
		catch(error){
			next(error);
		}
	}

	async updateSome(request: Request, response: Response, next: NextFunction){
		try{

			const controller = new PetController(response.locals.user);

			const { id } = request.params;

			const result = await controller.updateSome(request.body, id);

			return response.status(200).json(result);
		}
		catch(error){
			next(error);
		}
	}

	async delete(request: Request, response: Response, next: NextFunction) {
		try{

			const controller = new PetController(response.locals.user);

			const { id } = request.params;

			const result = await controller.delete(id);

			return response.status(200).json(result);
		}
		catch(error){
			next(error);
		}
	}

}