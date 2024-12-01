import router from 'express';
import {
  registerAccount,
  loginAccount,
  generateRefreshToken,
} from '../controllers/authController.js';
import {
  loginValidationRules,
  registerValidationRules,
  refreshValidationRules,
} from '../validations/authValidation.js';
import { validateRequest } from '../middlewares/validationMiddleware.js';

const authRouter = router();

authRouter.post(
  '/register',
  registerValidationRules,
  validateRequest,
  registerAccount,
);

authRouter.post('/login', loginValidationRules, validateRequest, loginAccount);

authRouter.post(
  '/refresh',
  refreshValidationRules,
  validateRequest,
  generateRefreshToken,
);

export default authRouter;
