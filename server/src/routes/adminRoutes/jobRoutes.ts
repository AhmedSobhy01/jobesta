import { Router } from 'express';
import {
  getJobs,
  updateJob,
  deleteJob,
} from '../../controllers/adminControllers/jobController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { validateRequest } from '../../middlewares/validationMiddleware.js';
import {
  updateJobValidationRules,
  deleteJobValidationRules,
} from '../../validations/adminValidations/jobValidations.js';

const jobRouter = Router();

jobRouter.get('/', getJobs);

jobRouter.put(
  '/:jobId',
  authenticate,
  updateJobValidationRules,
  validateRequest,
  updateJob,
);

jobRouter.delete(
  '/:jobId',
  authenticate,
  deleteJobValidationRules,
  validateRequest,
  deleteJob,
);

export default jobRouter;
