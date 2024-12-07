import { body, param } from 'express-validator';
import db from '../db/db.js';

export const createCategoryValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isString()
    .withMessage('Category description must be a string')
    .isLength({ max: 255 })
    .withMessage('Category name must not exceed 255 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Category description is required')
    .isString()
    .withMessage('Category description must be a string')
    .isLength({ max: 255 })
    .withMessage('Category description must not exceed 255 characters'),
];

export const deleteCategoryValidationRules = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Category ID is required')
    .isNumeric()
    .withMessage('Category ID must be a number')
    .custom(async (value) => {
      const category = await db.query(
        'SELECT * FROM categories WHERE id = $1',
        [value],
      );
      if (category.rows.length === 0) {
        throw new Error('Category not found');
      }
      return true;
    }),
];

export const deleteBadgeValidationRules = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Badge ID is required')
    .isNumeric()
    .withMessage('Badge ID must be a number')
    .custom(async (value) => {
      const badge = await db.query('SELECT * FROM badges WHERE id = $1', [
        value,
      ]);
      if (badge.rows.length === 0) {
        throw new Error('Badge not found');
      }
      return true;
    }),
];
