import { Router } from 'express';
import { validateRequest } from '../../middlewares/validationMiddleware.js';
import {
  deleteReviewValidationRules,
  getJobReviewsValidations,
  updateReviewValidationRules,
} from '../../validations/adminValidations/reviewsValidation.js';
import {
  deleteReview,
  getJobReviews,
  updateReview,
} from '../../controllers/adminControllers/reviewsController.js';

const reviewRouter = Router();

reviewRouter.get(
  '/:jobId',
  getJobReviewsValidations,
  validateRequest,
  getJobReviews,
);

reviewRouter.put(
  '/:reviewId',
  updateReviewValidationRules,
  validateRequest,
  updateReview,
);

reviewRouter.delete(
  '/:reviewId',
  deleteReviewValidationRules,
  validateRequest,
  deleteReview,
);

export default reviewRouter;
