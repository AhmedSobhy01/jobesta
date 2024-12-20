import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
  getNotifications,
  markNotificationsAsRead,
} from '../controllers/notificationController.js';

const notificationRouter = Router();

notificationRouter.get('/', authenticate, getNotifications);

notificationRouter.put('/mark-as-read', authenticate, markNotificationsAsRead);

export default notificationRouter;
