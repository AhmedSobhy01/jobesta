import { Router } from 'express';
import {
  getAccounts,
  createAccount,
  deleteAccount,
  banAccount,
  unbanAccount,
} from '../../controllers/adminControllers/accountsController.js';
import {
  createAccountValidationRules,
  deleteAccountValidationRules,
  banAccountValidationRules,
  unbanAccountValidationRules,
} from '../../validations/adminValidations/accountsValidation.js';
import { validateRequest } from '../../middlewares/validationMiddleware.js';

const accountsRouter = Router();

accountsRouter.get('/', getAccounts);
accountsRouter.post(
  '/',
  createAccountValidationRules,
  validateRequest,
  createAccount,
);

accountsRouter.delete(
  '/:accountId',
  deleteAccountValidationRules,
  validateRequest,
  deleteAccount,
);

accountsRouter.post(
  '/ban/:accountId',
  banAccountValidationRules,
  validateRequest,
  banAccount,
);

accountsRouter.post(
  '/unban/:accountId',
  unbanAccountValidationRules,
  validateRequest,
  unbanAccount,
);

export default accountsRouter;
