import { param } from 'express-validator';
import db from '../../db/db.js';

export const getPaymentsValidationRules = [
  param('accountId')
    .isNumeric()
    .withMessage('Account ID must be a number')
    .notEmpty()
    .withMessage('Account ID must not be empty')
    .custom(async (accountId) => {
      const accountQuery = await db.query(
        'SELECT * FROM accounts WHERE id = $1 AND (role = $2 OR role = $3)',
        [accountId, 'freelancer', 'client'],
      );

      if (accountQuery.rows.length === 0) {
        throw new Error('Account does not exist');
      }

      return true;
    }),
];
