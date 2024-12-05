import { Router } from 'express';
import {
  createJob,
  getJobById,
  getJobs,
} from '../controllers/jobController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { checkIfClient } from '../middlewares/clientMiddleware.js';
import { validateRequest } from '../middlewares/validationMiddleware.js';
import { getJobsValidationRules } from '../validations/jobValidations.js';

const jobRouter = Router();

jobRouter.get('/', getJobsValidationRules, validateRequest, getJobs);

jobRouter.get('/:id', getJobById);

jobRouter.post('/', authenticate, checkIfClient, createJob);

export default jobRouter;
