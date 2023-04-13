import { Request, Response, Router } from 'express';
import TutorRouter from './Tutor';
import ShelterRouter from './Shelter';

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

router.get('/tutores', tutorRouter.getAll);
router.get('/tutores/:id', tutorRouter.getOneById);
router.post('/tutores', tutorRouter.create);
router.put('/tutores/:id', tutorRouter.updateAll);
router.patch('/tutores/:id', tutorRouter.updateSome);
router.delete('/tutores/:id', tutorRouter.delete);

router.get('/abrigos', shelterRouter.getAll);
router.get('/abrigos/:id', shelterRouter.getOneById);
router.post('/abrigos', shelterRouter.create);
router.put('/abrigos/:id', shelterRouter.updateAll);
router.patch('/abrigos/:id', shelterRouter.updateSome);
router.delete('/abrigos/:id', shelterRouter.delete);

