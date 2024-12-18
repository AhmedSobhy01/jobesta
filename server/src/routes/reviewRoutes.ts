import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validationMiddleware.js';
import { createReviewValidtionRules } from '../validations/reviewValidations.js';
import { createReview, getReviews } from '../controllers/reviewController.js';

const reviewRouter = Router();

reviewRouter.get('/:username', getReviews);

reviewRouter.post(
  '/:jobId/:freelancerId',
  authenticate,
  createReviewValidtionRules,
  validateRequest,
  createReview,
);

export default reviewRouter;
