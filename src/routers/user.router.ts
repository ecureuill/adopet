import { Request, Response } from 'express';
import UserController from '../controller/user.controller';

export default class UserRouter {
	async auth(request: Request, response: Response){
		const controller = new UserController();

		const { email, password } = request.body;

		const result = await controller.auth(email, password);

		return response.status(200).json(result);
	}

	async create(request: Request, response: Response){
		const controller = new UserController();

		const result = await controller.create(request.body);

		return response.status(201).json(result);
	}

	async getAll(request: Request, response: Response){
		const controller = new UserController();
		const result = await controller.getAll();

		if(result.count === 0)
			return response.status(404).json({mensagem: 'Não encontrado'});

		return response.status(200).json(result);
	}

	async getOneById(request: Request, response: Response){
		const controller = new UserController();

		const { id } = request.params;

		const result = await controller.getOneById(id);

		return response.status(200).json(result);
	}

	async updateAll(request: Request, response: Response){
		const controller = new UserController();

		const { id } = request.params;

		const result = await controller.updateAll(request.body, id);

		return response.status(200).json(result);
	}

	async updateSome(request: Request, response: Response){
		const controller = new UserController();

		const { id } = request.params;

		const result = await controller.updateSome(request.body, id);

		return response.status(200).json(result);
	}

	async delete(request: Request, response: Response) {
		const controller = new UserController();

		const { id } = request.params;

		const result = await controller.delete(id);

		return response.status(200).json(result);
	}

}