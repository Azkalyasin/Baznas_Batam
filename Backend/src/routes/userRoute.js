import express from 'express';
import userController from '../controllers/userController.js';
import validate from '../middlewares/validateMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import { createUserSchema, updateUserSchema, queryUserSchema } from '../validations/userValidation.js';

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware(['superadmin']));

router.get('/', validate(queryUserSchema, 'query'), userController.getAll); // ← tambah 'query'
router.get('/:id', userController.getById);
router.post('/', validate(createUserSchema, 'body'), userController.create);
router.put('/:id', validate(updateUserSchema, 'body'), userController.update);
router.delete('/:id', userController.destroy);

export default router;
