import { Router } from 'express';
import {
  createJob,
  getJobById,
  getJobs,
  acceptProposal,
  closeJob,
} from '../controllers/jobController.js';
import { authenticate, prepareUser } from '../middlewares/authMiddleware.js';
import { checkIfClient } from '../middlewares/clientMiddleware.js';
import { validateRequest } from '../middlewares/validationMiddleware.js';
import {
  createJobsValidationRules,
  getJobsValidationRules,
  acceptProposalValidationRules,
  closeJobValidationRules,
} from '../validations/jobValidations.js';

const jobRouter = Router();

jobRouter.get('/', getJobsValidationRules, validateRequest, getJobs);

jobRouter.get('/:id', prepareUser, getJobById);

jobRouter.post(
  '/',
  authenticate,
  checkIfClient,
  createJobsValidationRules,
  validateRequest,
  createJob,
);

jobRouter.post(
  '/:jobId/:freelancerId/accept',
  authenticate,
  checkIfClient,
  acceptProposalValidationRules,
  validateRequest,
  acceptProposal,
);

jobRouter.delete(
  '/:jobId',
  authenticate,
  checkIfClient,
  closeJobValidationRules,
  validateRequest,
  closeJob,
);

export default jobRouter;
