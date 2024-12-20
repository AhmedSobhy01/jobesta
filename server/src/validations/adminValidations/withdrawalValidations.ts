import { param } from 'express-validator';
import db from '../../db/db.js';

export const getWithdrawalsValidationRules = [
  param('status')
    .optional()
    .isString()
    .withMessage('Status must be a string')
    .notEmpty()
    .withMessage('Status must not be empty')
    .isIn(['pending', 'completed'])
    .withMessage('Status must be pending or completed'),
];

export const completeWithdrawalValidationRules = [
  param('id')
    .isNumeric()
    .withMessage('ID must be a number')
    .notEmpty()
    .withMessage('ID must not be empty')
    .custom(async (id) => {
      const withdrawalQuery = await db.query(
        'SELECT * FROM withdrawals WHERE id = $1',
        [id],
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

export const deleteWithdrawalValidationRules = [
  param('id')
    .isNumeric()
    .withMessage('ID must be a number')
    .notEmpty()
    .withMessage('ID must not be empty')
    .custom(async (id) => {
      const withdrawalQuery = await db.query(
        'SELECT * FROM withdrawals WHERE id = $1',
        [id],
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
