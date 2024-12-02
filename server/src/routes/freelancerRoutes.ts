import { authenticate } from '../middlewares/authMiddleware.js';
import {
  getCurrentFreelancer,
  updateFreelancer,
} from '../controllers/freelancerController.js';
import { updateFreelancerValidationRules } from '../validations/freelancerValidations.js';
import { validateRequest } from '../middlewares/validationMiddleware.js';
import router from 'express';
import { checkIfFreelancer } from '../middlewares/freelancerMiddleware.js';

const freelancerRouter = router();

freelancerRouter.get(
  '/me',
  authenticate,
  checkIfFreelancer,
  getCurrentFreelancer,
);

freelancerRouter.put(
  '/me',
  authenticate,
  checkIfFreelancer,
  updateFreelancerValidationRules,
  validateRequest,
  updateFreelancer,
);

export default freelancerRouter;
