import { Request, Response, Router } from 'express';
import multer from 'multer';
import SchemaValidator from '../middlewares/SchemaValidator';
import { asyncHandler } from '../middlewares/asyncHandler';
import validatePermissions from '../middlewares/authorization-middleware';
import { JWTVerify } from '../middlewares/jwt-middleware';
import schemas from '../services/schemas';
import { Actions, Resources } from '../utils/consts';
import AdoptionRouter from './adoption.router';
import PetRouter from './pet.router';
import ShelterRouter from './shelter.router';
import TutorRouter from './tutor.router';
import UserRouter from './user.router';

export const router = Router();

const tutorRouter = new TutorRouter();
const shelterRouter = new ShelterRouter();
const petRouter = new PetRouter();
const userRouter = new UserRouter();
const adoptionRouter = new AdoptionRouter();

const validator = new SchemaValidator(schemas);

//TO-DO: fix captured params
const uuidRegex = '(([A-z0-9]+-){4}[A-z0-9]+)';

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

router.get('/ping/', (request: Request, response: Response) => {
	return response.send('pong');
});

router.post('/login',
	validator.validate({schema: 'loginSchema', data: 'body'}),
	asyncHandler(userRouter.auth)
);

router.post('/signup',
	validator.validate({schema: 'userSchema', data: 'body'}),
	asyncHandler(userRouter.create)
);

router.post('/signup/tutores/',
	validator.validate({schema: 'tutorSchema', data: 'body'}),
	asyncHandler(tutorRouter.create)
);

router.post('/signup/abrigos/',
	validator.validate({schema: 'shelterSchema', data: 'body'}),
	asyncHandler(shelterRouter.create)
);

router.all('*', 
	// (request: Request, response: Response, next: NextFunction) => {
	// 	// console.debug(request.params);
	// 	next();
	// },
	JWTVerify,
);

router.get('/users',
	validatePermissions(Resources.USER, Actions.READ), 
	asyncHandler(userRouter.getAll)
);
router.get(`/users/:id(${uuidRegex})`, 
	validatePermissions(Resources.USER, Actions.READ), 
	asyncHandler(userRouter.getOneById)
);
router.put(`/users/:id(${uuidRegex})`,
	validatePermissions(Resources.USER, Actions.UPDATE), 
	validator.validate({schema: 'userSchema', data: 'body', strictRequiredChecks: false}),
	asyncHandler(userRouter.updateAll)
);
router.patch(`/users/:id(${uuidRegex})`,
	validatePermissions(Resources.USER, Actions.UPDATE), 
	validator.validate({schema: 'userSchema', data: 'body', strictRequiredChecks: false}),
	asyncHandler(userRouter.updateSome)
);
router.delete(`/users/:id(${uuidRegex})`, 
	validatePermissions(Resources.USER, Actions.DELETE), 
	asyncHandler(userRouter.delete)
);

router.get('/tutores', 
	validatePermissions(Resources.TUTOR, Actions.READ), 
	asyncHandler(tutorRouter.getAll)
);
router.get(`/tutores/:id(${uuidRegex})`, 
	validatePermissions(Resources.TUTOR, Actions.READ), 
	asyncHandler(tutorRouter.getOneById)
);
router.put(`/tutores/:id(${uuidRegex})`, 
	validatePermissions(Resources.TUTOR, Actions.UPDATE), 
	validator.validate({schema: 'tutorSchema', data: 'body'}),
	asyncHandler(tutorRouter.updateAll)
);
router.patch(`/tutores/:id(${uuidRegex})`, 
	validatePermissions(Resources.TUTOR, Actions.UPDATE), 
	upload.single('photo'),
	asyncHandler(tutorRouter.updateSome)
);
router.delete(`/tutores/:id(${uuidRegex})`, 
	validatePermissions(Resources.TUTOR, Actions.DELETE), 
	asyncHandler(tutorRouter.delete)
);

router.get('/abrigos', 
	validatePermissions(Resources.SHELTER, Actions.READ), 
	asyncHandler(shelterRouter.getAll)
);
router.get(`/abrigos/:id(${uuidRegex})`, 
	validatePermissions(Resources.SHELTER, Actions.READ), 
	asyncHandler(shelterRouter.getOneById)
);
router.put(`/abrigos/:id(${uuidRegex})`, 
	validatePermissions(Resources.SHELTER, Actions.UPDATE), 
	validator.validate({schema: 'shelterSchema', data: 'body'}),
	asyncHandler(shelterRouter.updateAll)
);
router.patch(`/abrigos/:id(${uuidRegex})`, 
	validatePermissions(Resources.SHELTER, Actions.UPDATE), 
	validator.validate({schema: 'shelterSchema', data: 'body', strictRequiredChecks: false}),
	asyncHandler(shelterRouter.updateSome)
);
router.delete(`/abrigos/:id(${uuidRegex})`, 
	validatePermissions(Resources.SHELTER, Actions.DELETE), 
	asyncHandler(shelterRouter.delete)
);

router.get('/adocoes',
	validatePermissions(Resources.ADOPTION, Actions.READ),
	asyncHandler(adoptionRouter.getAll)
);
router.get(`/adocoes/:id(${uuidRegex})`,
	validatePermissions(Resources.ADOPTION, Actions.READ),
	asyncHandler(adoptionRouter.getOneById)
);
router.post('/adocoes', 
	validatePermissions(Resources.ADOPTION, Actions.CREATE), 
	validator.validate({schema: 'adoptionSchema', data: 'body'}),
	asyncHandler(adoptionRouter.create)
);
router.delete(`/adocoes/:id(${uuidRegex})`, 
	validatePermissions(Resources.ADOPTION, Actions.DELETE), 
	asyncHandler(adoptionRouter.delete)
);

router.get('/pets', 
	validatePermissions(Resources.PET, Actions.READ), 
	asyncHandler(petRouter.getAll)
);
router.get(`/pets/:id(${uuidRegex})`, 
	validatePermissions(Resources.PET, Actions.READ), 
	asyncHandler(petRouter.getOneById)
);
router.post('/pets', 
	validatePermissions(Resources.PET, Actions.CREATE), 
	validator.validate({schema: 'petSchema', data: 'body'}),
	asyncHandler(petRouter.create)
);
router.put(`/pets/:id(${uuidRegex})`, 
	validatePermissions(Resources.PET, Actions.UPDATE), 
	validator.validate({schema: 'petSchema', data: 'body'}),
	asyncHandler(petRouter.updateAll)
);
router.patch(`/pets/:id(${uuidRegex})`, 
	validatePermissions(Resources.PET, Actions.UPDATE), 
	validator.validate({schema: 'petSchema', data: 'body', strictRequiredChecks: false}),
	asyncHandler(petRouter.updateSome)
);
router.delete(`/pets/:id(${uuidRegex})`, 
	validatePermissions(Resources.PET, Actions.DELETE), 
	asyncHandler(petRouter.delete)
);

