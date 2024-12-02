import router from 'express';
import { getUser, updateUser } from '../controllers/usersController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { updateFreelancerValidationRules } from '../validations/userValidation.js';
import { validateRequest } from '../middlewares/validationMiddleware.js';

const usersRouter = router();

usersRouter.get('/me', authenticate, getUser);

usersRouter.put(
  '/me',
  authenticate,
  updateFreelancerValidationRules,
  validateRequest,
  updateUser,
);

export default usersRouter;
