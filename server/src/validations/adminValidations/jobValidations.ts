import { body, param } from 'express-validator';
import db from '../../db/db.js';

export const updateJobValidationRules = [
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

  body('title')
    .optional()
    .trim()
    .isString()
    .withMessage('Title must be a string')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),

  body('description')
    .optional()
    .trim()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),

  body('category')
    .optional()
    .trim()
    .isNumeric()
    .withMessage('Category must be a number')
    .custom(async (category) => {
      const categoryQuery = await db.query(
        'SELECT * FROM categories WHERE id = $1',
        [category],
      );

      if (categoryQuery.rows.length === 0) {
        throw new Error('Category does not exist');
      }

      return true;
    }),

  body('budget')
    .optional()
    .isNumeric()
    .withMessage('Budget must be a number')
    .isFloat({ min: 1 })
    .withMessage('Budget must be greater than 0'),

  body('duration')
    .optional()
    .isNumeric()
    .withMessage('Duration must be a number')
    .isInt({ min: 1 })
    .withMessage('Duration must be greater than 0'),
];

export const deleteJobValidationRules = [
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

export const closeJobValidationRules = [
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

      if (jobQuery.rows[0].status !== 'open') {
        throw new Error('Job is not open');
      }

      return true;
    }),
];

export const reopenJobValidationRules = [
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

      if (jobQuery.rows[0].status !== 'closed') {
        throw new Error('Job is not closed');
      }

      return true;
    }),
];
