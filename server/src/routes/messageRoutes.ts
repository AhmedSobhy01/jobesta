import { Router } from 'express';
import {
  getMessages,
  sendMessage,
  deleteMessage,
} from '../controllers/messageController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validationMiddleware.js';
import {
  getAllMessagesValidationRules,
  sendMessageValidationRules,
  deleteMessageValidationRules,
} from '../validations/messageValidations.js';

const messageRouter = Router();

messageRouter.get(
  '/:jobId/:freelancerId',
  authenticate,
  getAllMessagesValidationRules,
  validateRequest,
  getMessages,
);

messageRouter.post(
  '/:jobId/:freelancerId',
  authenticate,
  sendMessageValidationRules,
  validateRequest,
  sendMessage,
);

messageRouter.delete(
  '/:jobId/:freelancerId/:messageId',
  authenticate,
  deleteMessageValidationRules,
  validateRequest,
  deleteMessage,
);

export default messageRouter;
