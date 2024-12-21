import { body, param, query } from 'express-validator';
import db from '../../db/db.js';
import { IPreviousWork } from '../../models/model.js';

export const getAccountsValidationRules = [
  query('role')
    .optional()
    .isIn(['admin', 'freelancer', 'client'])
    .withMessage('Role must be either admin or freelancer or client'),

  query('search')
    .optional()
    .isString()
    .withMessage('Search query must be a string'),
];

export const freelancerDataValidationRules = [
  body('bio')
    .optional()
    .trim()
    .isString()
    .withMessage('Bio must be a string')
    .isLength({ max: 1023 })
    .withMessage('Bio must not exceed 1023 characters'),

  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array')
    .custom((skills) => {
      if (new Set(skills).size !== skills.length) {
        throw new Error('Skills must be unique');
      }

      return true;
    }),

  body('skills.*')
    .trim()
    .isString()
    .withMessage('Skill must be a string')
    .notEmpty()
    .withMessage('Skill must not be empty')
    .isLength({ max: 255 })
    .withMessage('Skill must not exceed 255 characters'),

  body('previousWork')
    .optional()
    .isArray()
    .withMessage('Previous work must be an array')
    .custom((previousWork) => {
      if (
        new Set(previousWork.map((work: IPreviousWork) => work.order)).size !==
        previousWork.length
      ) {
        throw new Error('Previous work order must be unique');
      }

      return true;
    }),

  body('previousWork.*.title')
    .trim()
    .notEmpty()
    .withMessage('Title must not be empty')
    .isString()
    .withMessage('Title must be a string')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),

  body('previousWork.*.description')
    .trim()
    .notEmpty()
    .withMessage('Description must not be empty')
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),

  body('previousWork.*.url')
    .optional()
    .trim()
    .isURL()
    .withMessage('URL must be a valid URL'),

  body('previousWork.*.order')
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
];

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

  body('confirmPassword')
    .notEmpty()
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }

      return true;
    }),

  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['client', 'freelancer', 'admin'])
    .withMessage('Role must be either client or freelancer or admin'),
  ...freelancerDataValidationRules,
];

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
        [value, req.params!.accountId],
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
        [value, req.params!.accountId],
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
    .trim()
    .custom((value, { req }) => {
      if (!req.body?.password) return true;

      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }

      return true;
    }),
  ...freelancerDataValidationRules,
];

export const deleteAccountValidationRules = [
  param('accountId')
    .notEmpty()
    .withMessage('Account id must not be empty')
    .isNumeric()
    .withMessage('Account id must be a number')
    .custom(async (accountId, { req }) => {
      const accountsQuery = await db.query(
        'SELECT id, role from accounts WHERE id = $1',
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

      if (accountsQuery.rows[0].role === 'client') {
        const query = await db.query(
          'SELECT COUNT(*) FROM payments WHERE client_id = $1',
          [accountId],
        );

        if (query.rows[0].count > 0)
          throw 'Cannot delete client that has payment history';
      } else if (accountsQuery.rows[0].role === 'freelancer') {
        const query = await db.query(
          'SELECT COUNT(*) FROM payments WHERE freelancer_id = (SELECT id FROM freelancers WHERE account_id = $1)',
          [accountId],
        );

        if (query.rows[0].count > 0)
          throw 'Cannot delete freelancer that has payment history';
      }

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
        'SELECT id, is_banned, role from accounts WHERE id = $1',
        [accountId],
      );

      if (accountsQuery.rowCount === 0) throw 'No account found with this id';

      if (accountsQuery.rows[0].role === 'admin')
        throw 'You cannot ban an admin account';

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
    .custom(async (accountId, { req }) => {
      const accountsQuery = await db.query(
        'SELECT id, is_banned from accounts WHERE id = $1',
        [accountId],
      );

      if (accountsQuery.rowCount === 0) throw 'No account found with this id';

      if (accountsQuery.rows[0].role === 'admin')
        throw 'You cannot unban an admin account';

      if (accountsQuery.rows[0].id === req.user.id)
        throw 'You cannot unban your own account';

      if (!accountsQuery.rows[0].is_banned) throw 'Account is not banned';

      return true;
    }),
];

export const getFreelancerValidationRules = [
  param('accountId')
    .notEmpty()
    .withMessage('Account id must not be empty')
    .isNumeric()
    .withMessage('Account id must be a number')
    .custom(async (accountId) => {
      const query = await db.query(
        'SELECT id FROM freelancers WHERE account_id = $1',
        [accountId],
      );
      if (query.rowCount === 0) {
        throw new Error('No freelancer found with this id');
      }
    }),
];
