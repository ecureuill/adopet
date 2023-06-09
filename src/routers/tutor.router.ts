import { NextFunction, Request, Response } from 'express';
import Flatted from 'flatted';
import TutorController from '../controller/tutor.controller';

export default class TutorRouter {
	async getAll(request: Request, response: Response, next: NextFunction){
		try {

			const controller = new TutorController(response.locals.user);
			
			const { page } = request.query;

			const result = await controller.getAll(Number(page));

			if(result.count === 0)
				return response.status(200).json({mensagem: 'Não encontrado'});

			return response.status(200).json(Flatted.parse(Flatted.stringify(result)));
		}
		catch(error){
			next(error);
		}
	}

	async getOneById(request: Request, response: Response, next: NextFunction){
		try {

			const controller = new TutorController(response.locals.user);

			const { id } = request.params;

			const result = await controller.getOneById(id);

			return response.status(200).json(Flatted.parse(Flatted.stringify(result)));
		}
		catch(error){
			next(error);
		}
	}

	async create(request: Request, response: Response, next: NextFunction){
		try {

			const controller = new TutorController(response.locals.user);

			const result = await controller.create(request.body);

			return response.status(201).json(Flatted.parse(Flatted.stringify(result)));
		}
		catch(error){
			next(error);
		}
	}

	async updateAll(request: Request, response: Response, next: NextFunction){
		try {

			const controller = new TutorController(response.locals.user);

			const { id } = request.params;

			const result = await controller.updateAll(request.body, id);

			return response.status(200).json(Flatted.parse(Flatted.stringify(result)));
		}
		catch(error){
			next(error);
		}
	}

	async updateSome(request: Request, response: Response, next: NextFunction){
		try {

			const controller = new TutorController(response.locals.user);

			const { id } = request.params;
			const { about ,...user} = request.body;

			const result = await controller.updateSome({about: about, user: user}, id, request.file);

			return response.status(200).json(Flatted.parse(Flatted.stringify(result)));
		}
		catch(error){
			next(error);
		}
	}

	async delete(request: Request, response: Response, next: NextFunction){
		try {

			const controller = new TutorController(response.locals.user);

			const { id } = request.params;

			const result = await controller.delete(id);

			return response.status(200).json(Flatted.parse(Flatted.stringify(result)));
		}
		catch(error){
			next(error);
		}
	}

}