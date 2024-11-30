import { body } from 'express-validator';
import { IPreviousWork } from '../models/model';

export const updateFreelancerValidationRules = [
  body('bio').optional().trim().isLength({ max: 1023 }),

  body('skills')
    .isArray()
    .withMessage('Skills must be an array')
    .custom((skills) => {
      if (new Set(skills).size !== skills.length) {
        throw new Error('Skills must be unique');
      }
      return true;
    }),

  body('previousWork')
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

  body('previousWork.*.title').trim().notEmpty().isLength({ max: 255 }),

  body('previousWork.*.description').trim().notEmpty().isLength({ max: 1000 }),

  body('previousWork.*.url').optional().isURL(),

  body('previousWork.*.order').isInt({ min: 1 }).notEmpty(),
];
