import { body, param, query } from 'express-validator';
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
    .isNumeric()
    .withMessage('Category must be a number')
    .notEmpty()
    .withMessage('Category must not be empty')
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
  query('categories')
    .optional()
    .trim()
    .customSanitizer((value) => {
      return value
        .split(',')
        .map((category: string) => parseInt(category.trim(), 10))
        .filter((category: number) => !isNaN(category));
    })
    .custom(async (categories) => {
      if (!Array.isArray(categories)) {
        throw new Error('Categories must be an array');
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

export const acceptProposalValidationRules = [
  param('id')
    .notEmpty()
    .isNumeric()
    .withMessage('Job id must be a number')
    .custom(async (id, { req }) => {
      const jobQuery = await db.query(
        'SELECT * FROM jobs WHERE id = $1 AND client_id = $2 AND status = $3',
        [id, req.user!.id, 'open'],
      );

      if (jobQuery.rows.length === 0) {
        throw new Error('Job does not exist');
      }
      return true;
    }),

  param('freelancerId')
    .notEmpty()
    .isNumeric()
    .withMessage('Freelancer id must be a number')
    .custom(async (freelancerId, { req }) => {
      const jobQuery = await db.query(
        'SELECT * FROM proposals WHERE job_id = $1 AND freelancer_id = $2 AND status = $3',
        [req.params!.id, freelancerId, 'pending'],
      );

      if (jobQuery.rows.length === 0) {
        throw new Error('Proposal does not exist');
      }
      return true;
    }),
];

export const rejectProposalValidationRules = [...acceptProposalValidationRules];
