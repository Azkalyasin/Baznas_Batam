import express from 'express';
import userController from '../controllers/userController.js';
import validate from '../middlewares/validateMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import { createUserSchema, updateUserSchema, queryUserSchema } from '../validations/userValidation.js';

const router = express.Router();

// Apply Auth and Role middleware to all routes
router.use(authMiddleware);
router.use(roleMiddleware(['superadmin']));

router.get('/', validate(queryUserSchema), userController.getAll); // GET /api/users
router.get('/:id', userController.getById);                        // GET /api/users/:id
router.post('/', validate(createUserSchema), userController.create); // POST /api/users
router.put('/:id', validate(updateUserSchema), userController.update); // PUT /api/users/:id
router.delete('/:id', userController.destroy);                     // DELETE /api/users/:id

export default router;
