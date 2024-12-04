import { body, query } from 'express-validator';
import db from '../db/db.js';

export const createJobsValidationRules = [
  body('title')
    .trim()
    .isString()
    .withMessage('Title must be a string')
    .notEmpty()
    .withMessage('Title must not be empty')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),

  body('description')
    .trim()
    .isString()
    .withMessage('Description must be a string')
    .notEmpty()
    .withMessage('Description must not be empty')
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),

  body('category')
    .trim()
    .isString()
    .withMessage('Category must be a string')
    .notEmpty()
    .withMessage('Category must not be empty')
    .isLength({ max: 255 })
    .withMessage('Category must not exceed 255 characters')
    .custom(async (category) => {
      const categoryQuery = await db.query(
        'SELECT * FROM categories WHERE name = $1',
        [category],
      );

      if (categoryQuery.rows.length === 0) {
        throw new Error('Category does not exist');
      }

      return true;
    }),

  body('budget')
    .isNumeric()
    .withMessage('Budget must be a number')
    .notEmpty()
    .withMessage('Budget must not be empty'),

  body('duration')
    .isNumeric()
    .withMessage('Duration must be a number')
    .notEmpty()
    .withMessage('Duration must not be empty'),
];

export const getJobsValidationRules = [
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string')
    .isLength({ max: 255 })
    .withMessage('Category must not exceed 255 characters')
    .custom(async (category) => {
      const categoryQuery = await db.query(
        'SELECT * FROM categories WHERE name = $1',
        [category],
      );

      if (categoryQuery.rows.length === 0) {
        throw new Error('Category does not exist');
      }

      return true;
    }),

  query('minBudget')
    .optional()
    .isNumeric()
    .withMessage('Minimum budget must be a number'),

  query('maxBudget')
    .optional()
    .isNumeric()
    .withMessage('Maximum budget must be a number'),

  query('sortBy')
    .optional()
    .isString()
    .withMessage('Sort by must be a string')
    .isLength({ max: 255 })
    .withMessage('Sort by must not exceed 255 characters')
    .custom((sortBy) => {
      if (
        !['budget', 'duration', 'created_at'].includes(sortBy.toLowerCase())
      ) {
        throw new Error('Invalid sort by value');
      }
      return true;
    }),

  query('sortOrder')
    .optional()
    .isString()
    .withMessage('Sort order must be a string')
    .isLength({ max: 4 })
    .withMessage('Sort order must not exceed 4 characters')
    .custom((sortOrder) => {
      if (!['asc', 'desc'].includes(sortOrder.toLowerCase())) {
        throw new Error('Invalid sort order value');
      }
      return true;
    }),
];
