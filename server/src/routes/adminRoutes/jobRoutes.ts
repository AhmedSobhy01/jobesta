import { Router } from 'express';
import {
  getJobs,
  updateJob,
  deleteJob,
  reopenJob,
} from '../../controllers/adminControllers/jobController.js';
import { validateRequest } from '../../middlewares/validationMiddleware.js';
import {
  updateJobValidationRules,
  deleteJobValidationRules,
  reopenJobValidationRules,
  closeJobValidationRules,
  getJobsValidationRules,
} from '../../validations/adminValidations/jobValidations.js';
import { closeJob } from '../../controllers/jobController.js';

const jobRouter = Router();

jobRouter.get('/', getJobsValidationRules, validateRequest, getJobs);

jobRouter.put(
  '/:jobId/reopen',
  reopenJobValidationRules,
  validateRequest,
  reopenJob,
);

jobRouter.put(
  '/:jobId/close',
  closeJobValidationRules,
  validateRequest,
  closeJob,
);

jobRouter.put('/:jobId', updateJobValidationRules, validateRequest, updateJob);

jobRouter.delete(
  '/:jobId',
  deleteJobValidationRules,
  validateRequest,
  deleteJob,
);

export default jobRouter;
