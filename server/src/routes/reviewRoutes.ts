import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validationMiddleware.js';
import {
  createReviewValidtionRules,
  deleteReviewValidtionRules,
} from '../validations/reviewValidations.js';
import { createReview, deleteReview } from '../controllers/reviewController.js';

const reviewRouter = Router();

reviewRouter.post(
  '/:jobId/:freelancerId',
  authenticate,
  createReviewValidtionRules,
  validateRequest,
  createReview,
);

reviewRouter.delete(
  '/:jobId/:freelancerId',
  authenticate,
  deleteReviewValidtionRules,
  validateRequest,
  deleteReview,
);

export default reviewRouter;
