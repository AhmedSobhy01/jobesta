import { Router } from 'express';
import { createJob, getJobs } from '../controllers/jobController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { checkIfClient } from '../middlewares/clientMiddleware';
import { validateRequest } from '../middlewares/validationMiddleware.js';
import { getJobsValidationRules } from '../validations/jobValidations.js';

const jobRouter = Router();

jobRouter.get('/', getJobsValidationRules, validateRequest, getJobs);

jobRouter.post('/', authenticate, checkIfClient, createJob);

export default jobRouter;
