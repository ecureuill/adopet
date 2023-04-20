import { Request, Response, Router } from 'express';
import TutorRouter from './tutor.router';
import ShelterRouter from './shelter.router';
import PetRouter from './pet.router';
import { asyncHandler } from '../middlewares/asyncHandler';
import SchemaValidator from '../middlewares/SchemaValidator';
import schemas from '../services/schemas';
import UserRouter from './user.router';
import { JWTVerify } from '../middlewares/jwt-middleware';
import { validateAuthorization } from '../middlewares/authorization-middleware';
import { Role } from '../types/enums';

export const router = Router();

const tutorRouter = new TutorRouter();
const shelterRouter = new ShelterRouter();
const petRouter = new PetRouter();
const userRouter = new UserRouter();

const validator = new SchemaValidator(schemas);

router.get('/ping', (request: Request, response: Response) => {
	console.debug(request.body);
	console.debug(request.params);
	return response.json({
		mensagem: 'pong'
	});
});

router.all('(/users)|(/tutores)',
	JWTVerify,
	validateAuthorization([Role.ADMIN])
);

router.put('*',
	JWTVerify,
);

router.patch('*',
	JWTVerify,
);

router.delete('*',
	JWTVerify,
	validateAuthorization([Role.ADMIN])
);

router.all('//:id', 
	validator.validate({schema: 'paramSchema', data: 'params'})
);

router.post('/login',
	asyncHandler(userRouter.auth)
);


router.get('/users',
	asyncHandler(userRouter.getAll)
);
router.get('/users/:id', 
	asyncHandler(userRouter.getOneById)
);
router.post('/users',
	validator.validate({schema: 'userSchema', data: 'body'}),
	asyncHandler(userRouter.create)
);
router.put('/users/:id',
	JWTVerify,
	validator.validate({schema: 'userSchema', data: 'body'}),
	asyncHandler(userRouter.updateAll)
);
router.patch('/users/:id',
	JWTVerify,
	validator.validate({schema: 'userSchema', data: 'body', strictRequiredChecks: false}),
	asyncHandler(userRouter.updateAll)
);
router.delete('/users/:id', 
	asyncHandler(userRouter.delete)
);

router.get('/tutores', 
	asyncHandler(tutorRouter.getAll)
);
router.get('/tutores/:id', 
	asyncHandler(tutorRouter.getOneById)
);
router.post('/tutores', 
	validator.validate({schema: 'tutorSchema', data: 'body'}),
	asyncHandler(tutorRouter.create)
);
router.put('/tutores/:id', 
	validator.validate({schema: 'tutorSchema', data: 'body'}),
	asyncHandler(tutorRouter.updateAll)
);
router.patch('/tutores/:id', 
	validator.validate({schema: 'tutorSchema', data: 'body', strictRequiredChecks: false}),
	asyncHandler(tutorRouter.updateSome)
);
router.delete('/tutores/:id', 
	asyncHandler(tutorRouter.delete)
);

router.get('/abrigos', 
	asyncHandler(shelterRouter.getAll)
);
router.get('/abrigos/:id', 
	asyncHandler(shelterRouter.getOneById)
);
router.post('/abrigos', 
	validator.validate({schema: 'shelterSchema', data: 'body'}),
	asyncHandler(shelterRouter.create)
);
router.put('/abrigos/:id', 
	validator.validate({schema: 'shelterSchema', data: 'body'}),
	asyncHandler(shelterRouter.updateAll)
);
router.patch('/abrigos/:id', 
	validator.validate({schema: 'shelterSchema', data: 'body', strictRequiredChecks: false}),
	asyncHandler(shelterRouter.updateSome)
);
router.delete('/abrigos/:id', 
	asyncHandler(shelterRouter.delete)
);

router.get('/pets', 
	asyncHandler(petRouter.getAll)
);
router.get('/pets/:id', 
	asyncHandler(petRouter.getOneById)
);
router.post('/pets', 
	validator.validate({schema: 'petSchema', data: 'body'}),
	asyncHandler(petRouter.create)
);
router.put('/pets/:id', 
	validator.validate({schema: 'petSchema', data: 'body'}),
	asyncHandler(petRouter.updateAll)
);
router.patch('/pets/:id', 
	validator.validate({schema: 'petSchema', data: 'body', strictRequiredChecks: false}),
	asyncHandler(petRouter.updateSome)
);
router.delete('/pets/:id', 
	asyncHandler(petRouter.delete)
);

