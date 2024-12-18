import { body, param } from 'express-validator';
import db from '../db/db.js';

export const completeMilestoneValidationRules = [
  param('jobId').isNumeric().withMessage('Job ID must be a number'),

  param('freelancerId')
    .isNumeric()
    .withMessage('Freelancer ID must be a number'),

  param('milestoneOrder')
    .isNumeric()
    .withMessage('Milestone order must be a number')
    .custom(async (value, { req }) => {
      const milestoneQuery = await db.query(
        `SELECT p.status proposal_status, j.status job_status, m.status milestone_status, j.client_id client_id FROM milestones m
        JOIN proposals p ON m.job_id = p.job_id AND m.freelancer_id = p.freelancer_id
        JOIN jobs j ON m.job_id = j.id
        WHERE m.job_id = $1 AND m.freelancer_id = $2 AND m.order = $3`,
        [req.params!.jobId, req.params!.freelancerId, value],
      );

      if (milestoneQuery.rows.length === 0)
        throw new Error('Milestone does not exist');

      if (milestoneQuery.rows[0].client_id !== req.user!.id)
        throw new Error('You are not authorized to complete this milestone');

      if (milestoneQuery.rows[0].milestone_status !== 'pending')
        throw new Error('Milestone has already been completed');

      if (milestoneQuery.rows[0].proposal_status !== 'accepted')
        throw new Error('Proposal has not been accepted');

      if (milestoneQuery.rows[0].job_status !== 'in_progress')
        throw new Error('Job is not in progress');

      return true;
    }),

  body('card')
    .isString()
    .withMessage('Card number must be a string')
    .isLength({ min: 16, max: 16 })
    .withMessage('Card number must be 16 characters long')
    .custom((value) => {
      if (!/^\d+$/.test(value))
        throw new Error('Card number must only contain numbers');

      return true;
    }),

  body('expiry')
    .isString()
    .withMessage('Expiration date must be a string')
    .custom((value) => {
      if (!/^\d{4}-\d{2}$/.test(value))
        throw new Error('Expiration date must be in the format YYYY-MM');

      return true;
    }),

  body('cvv')
    .isString()
    .withMessage('CVV must be a string')
    .isLength({ min: 3, max: 3 })
    .withMessage('CVV must be 3 characters long')
    .custom((value) => {
      if (!/^\d+$/.test(value))
        throw new Error('CVV must only contain numbers');

      return true;
    }),
];
