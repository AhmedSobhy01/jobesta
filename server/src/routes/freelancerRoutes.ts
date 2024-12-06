import { authenticate } from '../middlewares/authMiddleware.js';
import {
  // getCurrentFreelancer,
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

freelancerRouter.get('/:username', getFreelancerByUsername);

freelancerRouter.put(
  '/me',
  authenticate,
  checkIfFreelancer,
  updateFreelancerValidationRules,
  validateRequest,
  updateFreelancer,
);

export default freelancerRouter;
