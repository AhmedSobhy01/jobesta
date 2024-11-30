import { body } from 'express-validator';
import { IPreviousWork } from '../models/model';

export const updateFreelancerValidationRules = [
  body('bio')
    .optional()
    .trim()
    .isString()
    .withMessage('Bio must be a string')
    .isLength({ max: 1023 })
    .withMessage('Bio must not exceed 1023 characters'),

  body('skills')
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
