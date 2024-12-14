import { Router } from 'express';
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  banAccount,
  unbanAccount,
  getFreelancer,
} from '../../controllers/adminControllers/accountsController.js';
import {
  getAccountsValidationRules,
  createAccountValidationRules,
  updateAccountValidationRules,
  deleteAccountValidationRules,
  banAccountValidationRules,
  unbanAccountValidationRules,
  getFreelancerValidationRules,
} from '../../validations/adminValidations/accountsValidation.js';
import { validateRequest } from '../../middlewares/validationMiddleware.js';

const accountsRouter = Router();

accountsRouter.get(
  '/',
  getAccountsValidationRules,
  validateRequest,
  getAccounts,
);

accountsRouter.get(
  '/freelancer/:accountId',
  getFreelancerValidationRules,
  validateRequest,
  getFreelancer,
);


accountsRouter.post(
  '/',
  createAccountValidationRules,
  validateRequest,
  createAccount,
);

accountsRouter.put(
  '/:accountId',
  updateAccountValidationRules,
  validateRequest,
  updateAccount,
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
