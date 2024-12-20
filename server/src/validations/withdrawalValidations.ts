import { body, param } from 'express-validator';
import db from '../db/db.js';

export const createWithdrawalValidationRules = [
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .notEmpty()
    .withMessage('Amount must not be empty')
    .isFloat({ min: 1 })
    .withMessage('Amount must be greater than 0')
    .custom(async (amount, { req }) => {
      const freelancerQuery = await db.query(
        'SELECT * FROM freelancers WHERE id = $1',
        [req.user!.freelancer!.id],
      );

      if (freelancerQuery.rows.length === 0) {
        throw new Error('Freelancer does not exist');
      }

      if (freelancerQuery.rows[0].balance < amount) {
        throw new Error('Insufficient balance');
      }

      return true;
    }),

  body('paymentMethod')
    .isString()
    .withMessage('Payment method must be a string')
    .notEmpty()
    .withMessage('Payment method must not be empty')
    .isIn(['bank_transfer', 'paypal', 'ewallet'])
    .withMessage('Payment method must be bank_transfer, paypal or ewallet'),

  body('paymentUsername')
    .isString()
    .withMessage('Payment username must be a string')
    .notEmpty()
    .withMessage('Payment username must not be empty'),
];

export const deleteWithdrawalValidationRules = [
  param('id')
    .isNumeric()
    .withMessage('ID must be a number')
    .notEmpty()
    .withMessage('ID must not be empty')
    .custom(async (id, { req }) => {
      const withdrawalQuery = await db.query(
        'SELECT * FROM withdrawals WHERE id = $1 AND freelancer_id = $2',
        [id, req.user!.freelancer!.id],
      );

      if (withdrawalQuery.rows.length === 0) {
        throw new Error('Withdrawal does not exist');
      }

      if (withdrawalQuery.rows[0].status !== 'pending') {
        throw new Error('Withdrawal is not pending');
      }

      return true;
    }),
];
