import { Router } from 'express';
import {
  createJob,
  getJobById,
  getJobs,
  acceptProposal,
  rejectProposal,
} from '../controllers/jobController.js';
import { authenticate, prepareUser } from '../middlewares/authMiddleware.js';
import { checkIfClient } from '../middlewares/clientMiddleware.js';
import { validateRequest } from '../middlewares/validationMiddleware.js';
import {
  createJobsValidationRules,
  getJobsValidationRules,
  acceptProposalValidationRules,
  rejectProposalValidationRules,
} from '../validations/jobValidations.js';

const jobRouter = Router();

jobRouter.get('/', getJobsValidationRules, validateRequest, getJobs);

jobRouter.get('/:id', prepareUser, getJobById);

jobRouter.post(
  '/:id/:freelancerId/accept',
  authenticate,
  checkIfClient,
  acceptProposalValidationRules,
  validateRequest,
  acceptProposal,
);
jobRouter.post(
  '/:id/:freelancerId/reject',
  authenticate,
  checkIfClient,
  rejectProposalValidationRules,
  validateRequest,
  rejectProposal,
);

jobRouter.post(
  '/',
  authenticate,
  checkIfClient,
  createJobsValidationRules,
  validateRequest,
  createJob,
);

export default jobRouter;
