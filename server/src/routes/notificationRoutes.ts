import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { getNotifications } from '../controllers/notificationController.js';

const notificationRouter = Router();

notificationRouter.get('/', authenticate, getNotifications);

export default notificationRouter;
