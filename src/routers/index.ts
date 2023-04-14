import { Request, Response, Router } from 'express';
import TutorRouter from './tutor.router';
import ShelterRouter from './shelter.router';
import PetRouter from './pet.router';
import { asyncHandler } from '../middlewares/asyncHandler';

export const router = Router();

const tutorRouter = new TutorRouter();
const shelterRouter = new ShelterRouter();
const petRouter = new PetRouter();

router.get('/ping', (request: Request, response: Response) => {
	console.debug(request.body);
	console.debug(request.params);
	return response.json({
		mensagem: 'pong'
	});
});

router.get('/tutores', asyncHandler(tutorRouter.getAll));
router.get('/tutores/:id', asyncHandler(tutorRouter.getOneById));
router.post('/tutores',  asyncHandler(tutorRouter.create));
router.put('/tutores/:id', asyncHandler(tutorRouter.updateAll));
router.patch('/tutores/:id', asyncHandler(tutorRouter.updateSome));
router.delete('/tutores/:id', asyncHandler(tutorRouter.delete));

router.get('/abrigos', asyncHandler(shelterRouter.getAll));
router.get('/abrigos/:id', asyncHandler(shelterRouter.getOneById));
router.post('/abrigos', asyncHandler(shelterRouter.create));
router.put('/abrigos/:id', asyncHandler(shelterRouter.updateAll));
router.patch('/abrigos/:id', asyncHandler(shelterRouter.updateSome));
router.delete('/abrigos/:id', asyncHandler(shelterRouter.delete));

router.get('/pets', asyncHandler(petRouter.getAll));
router.get('/pets/:id', asyncHandler(petRouter.getOneById));
router.post('/pets', asyncHandler(petRouter.create));
router.put('/pets/:id', asyncHandler(petRouter.updateAll));
router.patch('/pets/:id', asyncHandler(petRouter.updateSome));
router.delete('/pets/:id', asyncHandler(petRouter.delete));

