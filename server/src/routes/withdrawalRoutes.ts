import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validationMiddleware.js';
import {
  createWithdrawalValidationRules,
  deleteWithdrawalValidationRules,
} from '../validations/withdrawalValidations.js';
import { checkIfFreelancer } from '../middlewares/freelancerMiddleware.js';
import {
  createWithdrawal,
  deleteWithdrawal,
  getWithdrawals,
} from '../controllers/withdrawalController.js';

const withdrawalRoutes = Router();

withdrawalRoutes.use(authenticate, checkIfFreelancer);

withdrawalRoutes.get('/', getWithdrawals);

withdrawalRoutes.post(
  '/',
  createWithdrawalValidationRules,
  validateRequest,
  createWithdrawal,
);

withdrawalRoutes.delete(
  '/:id',
  deleteWithdrawalValidationRules,
  validateRequest,
  deleteWithdrawal,
);

export default withdrawalRoutes;
