import { Router } from 'express';
import { validateRequest } from '../../middlewares/validationMiddleware.js';
import {
  deleteProposal,
  getJobProposals,
  updateProposal,
} from '../../controllers/adminControllers/proposalController.js';
import {
  deleteProposalValidationRules,
  getJobProposalsValidations,
  updateProposalValidationRules,
} from '../../validations/adminValidations/proposalValidations.js';

const proposalRouter = Router();

proposalRouter.get(
  '/:jobId',
  getJobProposalsValidations,
  validateRequest,
  getJobProposals,
);

proposalRouter.put(
  '/:jobId/:freelancerId',
  updateProposalValidationRules,
  validateRequest,
  updateProposal,
);

proposalRouter.delete(
  '/:jobId/:freelancerId',
  deleteProposalValidationRules,
  validateRequest,
  deleteProposal,
);

export default proposalRouter;
