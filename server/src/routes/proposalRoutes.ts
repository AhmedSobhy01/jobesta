import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { checkIfFreelancer } from '../middlewares/freelancerMiddleware.js';
import {
  createProposal,
  deleteProposal,
  getMyProposals,
  updateProposal,
} from '../controllers/proposalController.js';
import {
  createProposalValidationRules,
  updateProposalValidationRules,
  deleteProposalValidationRules,
} from '../validations/proposalValidation.js';
import { validateRequest } from '../middlewares/validationMiddleware.js';

const proposalRouter = Router();

proposalRouter.use(authenticate, checkIfFreelancer);

proposalRouter.get('/me', getMyProposals);

proposalRouter.post(
  '/:jobId',
  createProposalValidationRules,
  validateRequest,
  createProposal,
);

proposalRouter.put(
  '/:jobId',
  updateProposalValidationRules,
  validateRequest,
  updateProposal,
);

proposalRouter.delete(
  '/:jobId',
  deleteProposalValidationRules,
  validateRequest,
  deleteProposal,
);

export default proposalRouter;
