import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';

import { getPayments } from '../controllers/paymentsController.js';

const paymentRouter = Router();

paymentRouter.get('/', authenticate, getPayments);

export default paymentRouter;
