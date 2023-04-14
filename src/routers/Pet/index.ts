import { Request, Response } from 'express';

import PetController from '../../controller/Pet';
import { hasValidID, hasBody, hasRequiredFields, hasValidValue, idReplacememtIsNotAllowed } from '../../utils/validations';

export default class PetRouter {
	async getAll(request: Request, response: Response){
		const controller = new PetController();
		const result = await controller.getAll();

		if(result.count === 0)
			return response.status(404).json({mensagem: 'Não encontrado'});

		return response.status(200).json(result);
	}

	async getOneById(request: Request, response: Response){
		const controller = new PetController();

		const { id } = request.params;

		hasValidID(id); 
		
		const result = await controller.getOneById(id);

		return response.status(200).json(result);
	}

	async create(request: Request, response: Response){
		const controller = new PetController();

		hasBody(request.body);

		hasRequiredFields(request.body, ['name', 'age']);

		const result = await controller.create(request.body);

		return response.status(201).json(result);
	}

	async updateAll(request: Request, response: Response){
		const controller = new PetController();

		const { id } = request.params;

		hasValidID(id); 
		hasBody(request.body);
		hasRequiredFields(request.body, ['name', 'age']);
		idReplacememtIsNotAllowed(request.body.id, id);

		const result = await controller.updateAll(request.body, id);

		return response.status(200).json(result);
	}

	async updateSome(request: Request, response: Response){
		const controller = new PetController();

		const { id } = request.params;

		hasValidID(id); 
		hasBody(request.body);
		hasValidValue(request.body, 'name');
		hasValidValue(request.body, 'age');
		idReplacememtIsNotAllowed(request.body.id, id);

		const result = await controller.updateSome(request.body, id);

		return response.status(200).json(result);
	}

	async delete(request: Request, response: Response) {
		const controller = new PetController();

		const { id } = request.params;

		hasValidID(id); 

		const result = await controller.delete(id);

		return response.status(200).json(result);
	}

}