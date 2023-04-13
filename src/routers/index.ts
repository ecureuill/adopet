import { Request, Response, Router } from 'express';
import TutorRouter from './Tutor';
import ShelterRouter from './Shelter';
import { asyncHandler } from '../ErrorHandler';

export const router = Router();

const tutorRouter = new TutorRouter();
const shelterRouter = new ShelterRouter();

router.get('/ping', (request: Request, response: Response) => {
	console.debug(request.body);
	console.debug(request.params);
	return response.json({
		mensagem: 'pong'
	});
});

router.get('/tutores', asyncHandler(tutorRouter.getAll));
router.get('/tutores/:id', asyncHandler(tutorRouter.getOneById));
router.post('/tutores', asyncHandler(tutorRouter.create));
router.put('/tutores/:id', asyncHandler(tutorRouter.updateAll));
router.patch('/tutores/:id', asyncHandler(tutorRouter.updateSome));
router.delete('/tutores/:id', asyncHandler(tutorRouter.delete));

router.get('/abrigos', asyncHandler(shelterRouter.getAll));
router.get('/abrigos/:id', asyncHandler(shelterRouter.getOneById));
router.post('/abrigos', asyncHandler(shelterRouter.create));
router.put('/abrigos/:id', asyncHandler(shelterRouter.updateAll));
router.patch('/abrigos/:id', asyncHandler(shelterRouter.updateSome));
router.delete('/abrigos/:id', asyncHandler(shelterRouter.delete));
