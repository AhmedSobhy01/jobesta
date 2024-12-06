import { body } from 'express-validator';

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
