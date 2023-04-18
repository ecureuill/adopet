import { Request, Response, Router } from 'express';
import TutorRouter from './tutor.router';
import ShelterRouter from './shelter.router';
import PetRouter from './pet.router';
import { asyncHandler } from '../middlewares/asyncHandler';
import SchemaValidator from '../middlewares/SchemaValidator';
import schemas from '../services/schemas';

export const router = Router();

const tutorRouter = new TutorRouter();
const shelterRouter = new ShelterRouter();
const petRouter = new PetRouter();

const validator = new SchemaValidator(schemas);

router.get('/ping', (request: Request, response: Response) => {
	console.debug(request.body);
	console.debug(request.params);
	return response.json({
		mensagem: 'pong'
	});
});

router.get('/tutores', 
	asyncHandler(tutorRouter.getAll)
);
router.get('/tutores/:id', 
	validator.validate({schema: 'paramSchema', data: 'params'}), 
	asyncHandler(tutorRouter.getOneById)
);
router.post('/tutores', 
	validator.validate({schema: 'tutorSchema', data: 'body'}),
	asyncHandler(tutorRouter.create)
);
router.put('/tutores/:id', 
	validator.validate({schema: 'paramSchema', data: 'params'}), 
	validator.validate({schema: 'tutorSchema', data: 'body'}),
	asyncHandler(tutorRouter.updateAll)
);
router.patch('/tutores/:id', 
	validator.validate({schema: 'tutorSchema', data: 'body', strictRequiredChecks: false}),
	validator.validate({schema: 'paramSchema', data: 'params'}), 
	asyncHandler(tutorRouter.updateSome)
);
router.delete('/tutores/:id', 
	validator.validate({schema: 'paramSchema', data: 'params'}), 
	asyncHandler(tutorRouter.delete)
);

router.get('/abrigos', 
	asyncHandler(shelterRouter.getAll)
);
router.get('/abrigos/:id', 
	validator.validate({schema: 'paramSchema', data: 'params'}), 
	asyncHandler(shelterRouter.getOneById)
);
router.post('/abrigos', 
	validator.validate({schema: 'shelterSchema', data: 'body'}),
	asyncHandler(shelterRouter.create)
);
router.put('/abrigos/:id', 
	validator.validate({schema: 'shelterSchema', data: 'body'}),
	validator.validate({schema: 'paramSchema', data: 'params'}), 
	asyncHandler(shelterRouter.updateAll)
);
router.patch('/abrigos/:id', 
	validator.validate({schema: 'shelterSchema', data: 'body', strictRequiredChecks: false}),
	validator.validate({schema: 'paramSchema', data: 'params'}), 
	asyncHandler(shelterRouter.updateSome)
);
router.delete('/abrigos/:id', 
	validator.validate({schema: 'paramSchema', data: 'params'}), 
	asyncHandler(shelterRouter.delete)
);

router.get('/pets', 
	asyncHandler(petRouter.getAll)
);
router.get('/pets/:id', 
	validator.validate({schema: 'paramSchema', data: 'params'}), 
	asyncHandler(petRouter.getOneById)
);
router.post('/pets', 
	validator.validate({schema: 'petSchema', data: 'body'}),
	asyncHandler(petRouter.create)
);
router.put('/pets/:id', 
	validator.validate({schema: 'petSchema', data: 'body'}),
	validator.validate({schema: 'paramSchema', data: 'params'}), 
	asyncHandler(petRouter.updateAll)
);
router.patch('/pets/:id', 
	validator.validate({schema: 'petSchema', data: 'body', strictRequiredChecks: false}),
	validator.validate({schema: 'paramSchema', data: 'params'}), 
	asyncHandler(petRouter.updateSome)
);
router.delete('/pets/:id', 
	validator.validate({schema: 'paramSchema', data: 'params'}), 
	asyncHandler(petRouter.delete)
);

