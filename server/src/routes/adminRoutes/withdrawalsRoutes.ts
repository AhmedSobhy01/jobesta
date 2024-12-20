import { Router } from 'express';
import {} from '../../middlewares/authMiddleware.js';
import { validateRequest } from '../../middlewares/validationMiddleware.js';
import {
  getWithdrawalsValidationRules,
  completeWithdrawalValidationRules,
  deleteWithdrawalValidationRules,
} from '../../validations/adminValidations/withdrawalValidations.js';
import {
  getWithdrawals,
  completeWithdrawal,
  deleteWithdrawal,
} from '../../controllers/adminControllers/withdrawalController.js';

const withdrawalRoutes = Router();

withdrawalRoutes.get(
  '/',
  getWithdrawalsValidationRules,
  validateRequest,
  getWithdrawals,
);

withdrawalRoutes.post(
  '/:id/complete',
  completeWithdrawalValidationRules,
  validateRequest,
  completeWithdrawal,
);

withdrawalRoutes.delete(
  '/:id',
  deleteWithdrawalValidationRules,
  validateRequest,
  deleteWithdrawal,
);

export default withdrawalRoutes;
