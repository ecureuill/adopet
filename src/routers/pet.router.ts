import { Request, Response } from 'express';

import PetController from '../controller/pet.controller';

export default class PetRouter {
	async getAll(request: Request, response: Response){
		const controller = new PetController(response.locals.user);
		
		const { page } = request.query;

		const result = await controller.getAll(Number(page));

		if(result.count === 0)
			return response.status(200).json({mensagem: 'Não encontrado'});

		return response.status(200).json(result);
	}

	async getOneById(request: Request, response: Response){
		const controller = new PetController(response.locals.user);

		const { id } = request.params;

		const result = await controller.getOneById(id);

		return response.status(200).json(result);
	}

	async create(request: Request, response: Response){
		const controller = new PetController(response.locals.user);

		const result = await controller.create(request.body);

		return response.status(201).json(result);
	}

	async updateAll(request: Request, response: Response){
		const controller = new PetController(response.locals.user);

		const { id } = request.params;

		const result = await controller.updateAll(request.body, id);

		return response.status(200).json(result);
	}

	async updateSome(request: Request, response: Response){
		const controller = new PetController(response.locals.user);

		const { id } = request.params;

		const result = await controller.updateSome(request.body, id);

		return response.status(200).json(result);
	}

	async delete(request: Request, response: Response) {
		const controller = new PetController(response.locals.user);

		const { id } = request.params;

		const result = await controller.delete(id);

		return response.status(200).json(result);
	}

}