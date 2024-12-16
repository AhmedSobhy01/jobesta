import { Router } from 'express';
import { completeMilestone } from '../controllers/milestoneController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validationMiddleware.js';
import { completeMilestoneValidationRules } from '../validations/milestoneValidations.js';

const milestoneRouter = Router();

milestoneRouter.put(
  '/:jobId/:freelancerId/:milestoneOrder',
  authenticate,
  completeMilestoneValidationRules,
  validateRequest,
  completeMilestone,
);

export default milestoneRouter;
