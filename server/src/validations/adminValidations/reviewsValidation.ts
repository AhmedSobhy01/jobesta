import { body, param } from 'express-validator';
import db from '../../db/db.js';

export const getJobReviewsValidations = [
  param('jobId')
    .isNumeric()
    .withMessage('Job ID must be a number')
    .notEmpty()
    .withMessage('Job ID must not be empty')
    .custom(async (jobId) => {
      const jobQuery = await db.query('SELECT * FROM jobs WHERE id = $1', [
        jobId,
      ]);

      if (jobQuery.rows.length === 0) {
        throw new Error('Job does not exist');
      }

      return true;
    }),
];

export const updateReviewValidationRules = [
  param('reviewId')
    .isNumeric()
    .withMessage('Review ID must be a number')
    .notEmpty()
    .withMessage('Review ID must not be empty')
    .custom(async (reviewId) => {
      const reviewQuery = await db.query(
        'SELECT * FROM reviews WHERE id = $1',
        [reviewId],
      );

      if (reviewQuery.rows.length === 0) {
        throw new Error('Review does not exist');
      }

      return true;
    }),

  body('rating')
    .isNumeric()
    .withMessage('Rating must be a number')
    .notEmpty()
    .withMessage('Rating must not be empty')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('comment')
    .trim()
    .optional()
    .isString()
    .withMessage('Comment must be a string')
    .isLength({ max: 255 })
    .withMessage('Comment must not exceed 255 characters'),
];

export const deleteReviewValidationRules = [
  param('reviewId')
    .isNumeric()
    .withMessage('Review ID must be a number')
    .notEmpty()
    .withMessage('Review ID must not be empty')
    .custom(async (reviewId) => {
      const reviewQuery = await db.query(
        'SELECT * FROM reviews WHERE id = $1',
        [reviewId],
      );

      if (reviewQuery.rows.length === 0) {
        throw new Error('Review does not exist');
      }

      return true;
    }),
];
