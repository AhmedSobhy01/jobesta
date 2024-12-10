import { authenticate, prepareUser } from '../middlewares/authMiddleware.js';
import {
  updateFreelancer,
  getFreelancerByUsername,
  getFreelancerBalance,
} from '../controllers/freelancerController.js';
import { updateFreelancerValidationRules } from '../validations/freelancerValidations.js';
import { validateRequest } from '../middlewares/validationMiddleware.js';
import router from 'express';
import { checkIfFreelancer } from '../middlewares/freelancerMiddleware.js';

const freelancerRouter = router();

freelancerRouter.get(
  '/balance',
  authenticate,
  checkIfFreelancer,
  getFreelancerBalance,
);

freelancerRouter.get('/:username', prepareUser, getFreelancerByUsername);

freelancerRouter.put(
  '/me',
  authenticate,
  checkIfFreelancer,
  updateFreelancerValidationRules,
  validateRequest,
  updateFreelancer,
);

export default freelancerRouter;
