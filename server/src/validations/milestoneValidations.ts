import { param } from 'express-validator';
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
];
