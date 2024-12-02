import router from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { getAccount, updateAccount } from '../controllers/accountController.js';
import { updateAccountValidationRules } from '../validations/accountValidations.js';
import { validateRequest } from '../middlewares/validationMiddleware.js';

const usersRouter = router();

usersRouter.get('/me', authenticate, getAccount);

usersRouter.put(
  '/me',
  authenticate,
  updateAccountValidationRules,
  validateRequest,
  updateAccount,
);

export default usersRouter;
