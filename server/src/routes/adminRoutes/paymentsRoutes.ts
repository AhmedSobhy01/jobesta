import { Router } from 'express';
import {} from '../../middlewares/authMiddleware.js';
import { validateRequest } from '../../middlewares/validationMiddleware.js';
import { getPaymentsValidationRules } from '../../validations/adminValidations/paymentValidations.js';
import { getPaymentsForAccount } from '../../controllers/adminControllers/paymentsController.js';

const paymentsRoutes = Router();

paymentsRoutes.get(
  '/:accountId',
  getPaymentsValidationRules,
  validateRequest,
  getPaymentsForAccount,
);

export default paymentsRoutes;
