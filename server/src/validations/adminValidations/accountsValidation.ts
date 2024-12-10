import { body, param } from 'express-validator';
import db from '../../db/db.js';

export const createAccountValidationRules = [
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
    .isIn(['client', 'freelancer', 'admin'])
    .withMessage('Role must be either client or freelancer'),
];

export const deleteAccountValidationRules = [
  param('accountId')
    .notEmpty()
    .withMessage('Account id must not be empty')
    .isNumeric()
    .withMessage('Account id must be a number')
    .custom(async (accountId, { req }) => {
      const accountsQuery = await db.query(
        'SELECT id from accounts WHERE id = $1',
        [accountId],
      );
      if (accountsQuery.rowCount === 0) throw 'No account found with this id';
      if (accountsQuery.rows[0].id === req.user.id)
        throw 'You cannot delete your own account';

      const query2 = await db.query(
        "SELECT COUNT(*) from accounts WHERE role = 'admin'",
      );
      if (query2.rows[0].count === 1)
        throw 'You cannot delete the only admin account';

      return true;
    }),
];

export const banAccountValidationRules = [
  param('accountId')
    .notEmpty()
    .withMessage('Account id must not be empty')
    .isNumeric()
    .withMessage('Account id must be a number')
    .custom(async (accountId, { req }) => {
      const accountsQuery = await db.query(
        'SELECT id, is_banned from accounts WHERE id = $1',
        [accountId],
      );
      if (accountsQuery.rowCount === 0) throw 'No account found with this id';
      console.log(req.user.id);
      if (accountsQuery.rows[0].id === req.user.id)
        throw 'You cannot ban your own account';
      if (accountsQuery.rows[0].is_banned) throw 'Account is already banned';
      return true;
    }),
];

export const unbanAccountValidationRules = [
  param('accountId')
    .notEmpty()
    .withMessage('Account id must not be empty')
    .isNumeric()
    .withMessage('Account id must be a number')
    .custom(async (accountId) => {
      const accountsQuery = await db.query(
        'SELECT id, is_banned from accounts WHERE id = $1',
        [accountId],
      );
      if (accountsQuery.rowCount === 0) throw 'No account found with this id';
      if (!accountsQuery.rows[0].is_banned) throw 'Account is not banned';
      return true;
    }),
];
