import { body, param } from 'express-validator';
import db from '../db/db.js';
import { upload } from '../middlewares/imageUploadMiddleware.js';

const paramsValidation = [
  param('jobId').isNumeric().withMessage('Job ID must be a number'),

  param('freelancerId')
    .isNumeric()
    .withMessage('Freelancer ID must be a number')
    .custom(async (value, { req }) => {
      const proposalQuery = await db.query(
        'SELECT p.status, j.client_id, f.account_id FROM proposals p JOIN jobs j ON j.id = p.job_id LEFT JOIN freelancers f ON p.freelancer_id = f.id WHERE p.job_id = $1 AND p.freelancer_id = $2',
        [req.params!.jobId, value],
      );

      if (
        proposalQuery.rows.length === 0 ||
        (proposalQuery.rows[0].client_id !== req.user.id &&
          proposalQuery.rows[0].account_id !== req.user.id)
      )
        throw new Error('Proposal does not exist');

      if (proposalQuery.rows[0].status !== 'accepted')
        throw new Error('Proposal not accepted');

      return true;
    }),
];

export const getAllMessagesValidationRules = [...paramsValidation];

export const sendMessageValidationRules = [
  upload.single('file'),

  ...paramsValidation,

  body('message')
    .isString()
    .withMessage('Message must be a string')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters'),
];

export const deleteMessageValidationRules = [
  ...paramsValidation,

  param('messageId')
    .isNumeric()
    .withMessage('Message ID must be a number')
    .custom(async (value, { req }) => {
      const messageQuery = await db.query(
        'SELECT m.id FROM messages m WHERE m.id = $1 AND m.job_id = $2 AND m.freelancer_id = $3',
        [value, req.params!.jobId, req.params!.freelancerId],
      );

      if (messageQuery.rows.length === 0)
        throw new Error('Message does not exist');

      return true;
    }),
];
