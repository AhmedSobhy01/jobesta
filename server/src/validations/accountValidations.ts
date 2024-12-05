import { body } from 'express-validator';
import db from '../db/db.js';

export const updateAccountValidationRules = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isAlpha()
    .withMessage('First name must contain only letters')
    .isLength({ max: 255 })
    .withMessage('Last name must not exceed 255 characters'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isAlpha()
    .withMessage('Last name must contain only letters')
    .isLength({ max: 255 })
    .withMessage('Last name must not exceed 255 characters'),

  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .isLength({ max: 255 })
    .withMessage('Username must not exceed 255 characters')
    .isAlphanumeric()
    .withMessage('Username must contain only letters and numbers')
    .custom(async (value, { req }) => {
      const query = await db.query(
        'SELECT * FROM accounts WHERE username = $1 AND id != $2',
        [value, req.user!.id],
      );
      if (query.rowCount !== null && query.rowCount > 0) {
        return Promise.reject('Username already in use');
      }
    }),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Email must be a valid email address')
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters')
    .custom(async (value, { req }) => {
      const query = await db.query(
        'SELECT * FROM accounts WHERE email = $1 AND id != $2',
        [value, req.user!.id],
      );
      if (query.rowCount !== null && query.rowCount > 0) {
        return Promise.reject('Email already in use');
      }
    }),

  body('password')
    .optional()
    .trim()
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .isLength({ max: 255 })
    .withMessage('Password must not exceed 255 characters')
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),

  body('confirmPassword')
    .optional()
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }

      return true;
    }),
];
