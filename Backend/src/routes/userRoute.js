import express from 'express';
import userController from '../controllers/userController.js';
import validate from '../middlewares/validateMiddleware.js';
import { registerUserSchema, loginUserSchema } from '../validations/userValidation.js';

const router = express.Router();

router.post('/register', validate(registerUserSchema), userController.register);
router.post('/login', validate(loginUserSchema), userController.login);

export default router;
