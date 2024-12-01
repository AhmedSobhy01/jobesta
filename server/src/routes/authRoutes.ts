import router from 'express';
import {
  registerAccount,
  loginAccount,
  generateRefreshToken,
} from '../controllers/authController';
import {
  loginValidationRules,
  registerValidationRules,
  refreshValidationRules,
} from '../validations/authValidation';
import { validateRequest } from '../middlewares/validationMiddleware';

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
