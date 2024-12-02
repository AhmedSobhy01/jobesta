import { body } from 'express-validator';
import db from '../db/db.js';

export const loginValidationRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),

  body('password').trim().notEmpty().withMessage('Password is required'),
];

export const registerValidationRules = [
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isAlpha()
    .withMessage('First name must contain only letters')
    .isLength({ max: 255 })
    .withMessage('Last name must not exceed 255 characters'),

  body('last_name')
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
    .isAlphanumeric()
    .withMessage('Username must contain only letters and numbers')
    .custom(async (value) => {
      const query = await db.query(
        'SELECT * FROM accounts WHERE username = $1',
        [value],
      );
      if (query.rowCount !== null && query.rowCount > 0) {
        return Promise.reject('Username already in use');
      }
    }),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters')
    .custom(async (value) => {
      const query = await db.query('SELECT * FROM accounts WHERE email = $1', [
        value,
      ]);
      if (query.rowCount !== null && query.rowCount > 0) {
        return Promise.reject('Email already in use');
      }
    }),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .isLength({ max: 255 })
    .withMessage('Password must not exceed 255 characters')
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),

  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['client', 'freelancer'])
    .withMessage('Role must be either client or freelancer'),
];

export const refreshValidationRules = [
  body('refresh_token')
    .trim()
    .notEmpty()
    .withMessage('Refresh token is required'),
];
