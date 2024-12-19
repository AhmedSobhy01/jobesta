import { param, body } from 'express-validator';
import db from '../../db/db.js';
import { upload } from '../../middlewares/imageUploadMiddleware.js';

export const updateBadgeValidationRules = [
  upload.single('file'),
  param('id')
    .isNumeric()
    .withMessage('Badge id must be a number')
    .custom(async (id) => {
      const badge = await db.query('SELECT * FROM badges WHERE id = $1', [id]);
      if (badge.rows.length === 0) {
        throw new Error('Badge not found');
      }
      return true;
    }),
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ max: 255 })
    .withMessage('Name must be between 1 and 50 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 255 })
    .withMessage('Description must be between 1 and 255 characters'),
];
