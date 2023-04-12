import { Request, Response } from 'express';

import TutorController from '../../controller/Tutor';
import { hasRequiredValues, isValidBody, isValidID } from '../utils';
import { EntityNotFoundError } from 'typeorm';

export default class TutorRouter {
	async getAll(request: Request, response: Response){
		try{
			const controller = new TutorController();
			const result = await controller.getAll();

			if(result.count === 0)
				return response.status(404).json({mensagem: 'Não encontrado'});

			return response.status(200).json(result);
		}
		catch(error){
			if (error instanceof EntityNotFoundError)
				return response.status(404).json({mensagem: 'Não encontrado'});

			console.error(error);
			return response.status(500).json();
		}
	}

	async getOneById(request: Request, response: Response){
		try{
			const controller = new TutorController();

			const { id } = request.params;

			const { validUUID, invalidUUIDMessage } = isValidID(id); 
			if(!validUUID)
				return response.status(400).json({mensagem: invalidUUIDMessage});

			const result = await controller.getOneById(id);

			if(result === null)
				return response.status(404).json({mensagem: 'Não encontrado'});

			return response.status(200).json(result);
		}
		catch(error){
			if (error instanceof EntityNotFoundError)
				return response.status(404).json({mensagem: 'Não encontrado'});

			console.error(error);
			return response.status(500).json();
		}
	}

	async create(request: Request, response: Response){
		try {
			const controller = new TutorController();

			const { validBody, invalidBodyMessage } = isValidBody(request.body);

			if(!validBody)
				return response.status(400).json({mensagem: invalidBodyMessage});

			const { name, password, email } = request.body;

			const {validValue, invalidValueMessage} = hasRequiredValues( name, password, email);

			if(!validValue)
				return response.status(400).json({mensagem: invalidValueMessage});

			const result = await controller.create(name, email, password);

			return response.status(201).json(result);
		}
		catch(error){
			if (error instanceof EntityNotFoundError)
				return response.status(404).json({mensagem: 'Não encontrado'});

			console.error(error);
			return response.status(500).json();
		}
	}

	async updateAll(request: Request, response: Response){
		try {
			const controller = new TutorController();

			const { id } = request.params;

			const { validUUID, invalidUUIDMessage } = isValidID(id); 
			if(!validUUID)
				return response.status(400).json({mensagem: invalidUUIDMessage});

			const { validBody, invalidBodyMessage } = isValidBody(request.body);
			
			if(!validBody)
				return response.status(400).json({mensagem: invalidBodyMessage});

			const { name, password, email } = request.body;

			const {validValue, invalidValueMessage} = hasRequiredValues( name, password, email);

			if(!validValue)
				return response.status(400).json({mensagem: invalidValueMessage});

			const result = await controller.updateAll(request.body, id);

			return response.status(200).json(result);
		}
		catch(error){
			if (error instanceof EntityNotFoundError)
				return response.status(404).json({mensagem: 'Não encontrado'});

			console.error(error);
			return response.status(500).json();
		}
	}

	async updateSome(request: Request, response: Response){
		try {
			const controller = new TutorController();

			const { id } = request.params;

			const { validUUID, invalidUUIDMessage } = isValidID(id); 
			if(!validUUID)
				return response.status(400).json({mensagem: invalidUUIDMessage});

			const { validBody, invalidBodyMessage } = isValidBody(request.body);
			
			if(!validBody)
				return response.status(400).json({mensagem: invalidBodyMessage});

			if(request.body.email?.length === 0)
				return response.status(400).json({mensagem: 'invalid email'});

			if(request.body.name?.length === 0)
				return response.status(400).json({mensagem: 'invalid name'});

			if(request.body.password?.length === 0)
				return response.status(400).json({mensagem: 'invalid password'});

			const result = await controller.updateSome(request.body, id);

			return response.status(200).json(result);
		}
		catch(error){
			if (error instanceof EntityNotFoundError)
				return response.status(404).json({mensagem: 'Não encontrado'});

			console.error(error);
			return response.status(500).json();
		}
	}

	async delete(request: Request, response: Response) {
		try{
			const controller = new TutorController();

			const { id } = request.params;

			const { validUUID, invalidUUIDMessage } = isValidID(id); 
			if(!validUUID)
				return response.status(400).json({mensagem: invalidUUIDMessage});

			const result = await controller.delete(id);

			return response.status(200).json(result);
		}
		catch (error){
			if (error instanceof EntityNotFoundError)
				return response.status(404).json({mensagem: 'Não encontrado'});

			console.error(error);
			return response.status(500).json();
		}
	}

}