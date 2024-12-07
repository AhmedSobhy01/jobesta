import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { checkIfFreelancer } from '../middlewares/freelancerMiddleware.js';
import { checkIfClient } from '../middlewares/clientMiddleware.js';
import {
  createProposal,
  getMyProposals,
  getProposalsByJobId,
  updateProposal,
} from '../controllers/proposalController.js';
import {
  createProposalValidationRules,
  updateProposalValidationRules,
} from '../validations/proposalValidation.js';
import { validateRequest } from '../middlewares/validationMiddleware.js';

const proposalRouter = Router();

proposalRouter.use(authenticate);

proposalRouter.get('/me', checkIfFreelancer, getMyProposals);

proposalRouter.get('/:jobId', checkIfClient, getProposalsByJobId);

proposalRouter.post(
  '/:jobId',
  checkIfFreelancer,
  createProposalValidationRules,
  validateRequest,
  createProposal,
);

proposalRouter.put(
  '/:jobId',
  checkIfFreelancer,
  updateProposalValidationRules,
  validateRequest,
  updateProposal,
);

export default proposalRouter;
