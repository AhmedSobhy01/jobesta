import { body, param } from 'express-validator';
import { IMilestone } from '../models/model';
import db from '../db/db.js';

const validProposal = [
  body('coverLetter')
    .trim()
    .notEmpty()
    .withMessage('Cover letter is required')
    .isLength({ max: 1000 })
    .withMessage('Cover letter must not exceed 1000 characters'),

  body('milestones')
    .isArray({ min: 1 })
    .withMessage('Milestones must be an array')
    .custom((milestones) => {
      if (
        new Set(milestones.map((milestone: IMilestone) => milestone.order))
          .size !== milestones.length
      ) {
        throw new Error('Milestone order must be unique');
      }
      return true;
    }),

  body('milestones.*.order')
    .isNumeric()
    .withMessage('Order must be a number')
    .notEmpty()
    .withMessage('Order must not be empty'),

  body('milestones.*.name')
    .trim()
    .notEmpty()
    .withMessage('Name must not be empty')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ max: 255 })
    .withMessage('Name must not exceed 255 characters'),

  body('milestones.*.duration')
    .isNumeric()
    .withMessage('Duration must be a number')
    .notEmpty()
    .withMessage('Duration must not be empty')
    .isInt({ min: 1 }),

  body('milestones.*.amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .notEmpty()
    .withMessage('Amount must not be empty')
    .isFloat({ min: 1 }),
];

export const createProposalValidationRules = [
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

      return true;
    })
    .custom(async (jobId, { req }) => {
      const proposalQuery = await db.query(
        'SELECT * FROM proposals WHERE job_id = $1 AND freelancer_id = $2',
        [jobId, req.user!.freelancer!.id],
      );

      if (proposalQuery.rows.length !== 0) {
        throw new Error('Proposal already exists');
      }

      return true;
    }),

  ...validProposal,
];

export const updateProposalValidationRules = [
  param('jobId')
    .isNumeric()
    .withMessage('Job ID must be a number')
    .notEmpty()
    .withMessage('Job ID must not be empty')
    .custom(async (jobId, { req }) => {
      const proposalQuery = await db.query(
        'SELECT * FROM proposals WHERE job_id = $1 AND freelancer_id = $2',
        [jobId, req.user!.freelancer!.id],
      );

      if (proposalQuery.rows.length === 0) {
        throw new Error('Proposal does not exists for this job');
      }
      if (proposalQuery.rows[0].status !== 'pending') {
        throw new Error('Proposal cannot be updated for this job');
      }

      return true;
    }),
  ...validProposal,
];

export const deleteProposalValidationRules = [
  param('jobId')
    .isNumeric()
    .withMessage('Job ID must be a number')
    .notEmpty()
    .withMessage('Job ID must not be empty')
    .custom(async (jobId, { req }) => {
      const proposalQuery = await db.query(
        'SELECT * FROM proposals WHERE job_id = $1 AND freelancer_id = $2',
        [jobId, req.user!.freelancer!.id],
      );

      if (proposalQuery.rows.length === 0) {
        throw new Error('Proposal does not exist');
      }

      if (proposalQuery.rows[0].status !== 'pending') {
        throw new Error('Proposal cannot be deleted');
      }

      return true;
    }),
];
