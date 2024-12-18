import { body, param } from 'express-validator';
import db from '../db/db.js';

export const createReviewValidtionRules = [
  body('rating')
    .isNumeric()
    .withMessage('Rating must be a number')
    .notEmpty()
    .withMessage('Rating must not be empty')
    .custom((rating) => {
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be number between 1 and 5');
      }
      return true;
    }),

  body('comment')
    .isString()
    .withMessage('Message must be a string')
    .isLength({ max: 255 })
    .withMessage('Name must not exceed 255 characters'),

  param('jobId')
    .isNumeric()
    .withMessage('Job ID must be a number')
    .notEmpty()
    .withMessage('Job ID must not be empty')
    .custom(async (jobId) => {
      const jobQuery = await db.query('SELECT * FROM jobs WHERE id = $1', [
        jobId,
      ]);

      if (jobQuery.rows.length === 0) {
        throw new Error('Job does not exist');
      }

      if (jobQuery.rows[0].status !== 'completed') {
        throw new Error('Job is not completed');
      }

      return true;
    }),

  param('freelancerId')
    .isNumeric()
    .withMessage('Freelancer ID must be a number')
    .notEmpty()
    .withMessage('Freelancer ID must not be empty')
    .custom(async (freelancerId, { req }) => {
      const proposalQuery = await db.query(
        'SELECT f.account_id AS freelanceraccount, j.client_id AS clientaccount, p.status AS status FROM proposals p JOIN freelancers f ON f.id = p.freelancer_id JOIN jobs j ON j.id = p.job_id WHERE p.freelancer_id = $1 AND p.job_id = $2',
        [freelancerId, req.params!.jobId],
      );

      if (proposalQuery.rows.length === 0) {
        throw new Error('Proposal does not exist');
      }

      if (proposalQuery.rows[0].status !== 'accepted') {
        throw new Error('Proposal is not accepted');
      }

      if (
        proposalQuery.rows[0].freelanceraccount !== req.user.id &&
        proposalQuery.rows[0].clientaccount !== req.user.id
      ) {
        throw new Error('User can`t send review');
      }

      console.log(req.params!.jobId, freelancerId, req.user.id);
      const reviewQuery = await db.query(
        'SELECT * FROM reviews WHERE job_id = $1 AND freelancer_id = $2 AND account_id = $3',
        [req.params!.jobId, freelancerId, req.user.id],
      );

      if (reviewQuery.rows.length !== 0) {
        console.log('reviewQuery');
        throw new Error('Review already exist');
      }

      return true;
    }),
];
