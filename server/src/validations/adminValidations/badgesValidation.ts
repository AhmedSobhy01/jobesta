import { param } from 'express-validator';
import db from '../../db/db.js';

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
        throw new Error('No badge found with this id');
      }
      return true;
    }),
];
