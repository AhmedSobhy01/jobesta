import router from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
  getAccount,
  updateAccount,
  updateProfilePicture,
  getUserByUsername,
} from '../controllers/accountController.js';
import { updateAccountValidationRules } from '../validations/accountValidations.js';
import { validateRequest } from '../middlewares/validationMiddleware.js';
import { upload } from '../middlewares/imageUploadMiddleware.js';

const accountRouter = router();

accountRouter.get('/:username', getUserByUsername);

accountRouter.get('/me', authenticate, getAccount);

accountRouter.put(
  '/me',
  authenticate,
  updateAccountValidationRules,
  validateRequest,
  updateAccount,
);

accountRouter.put(
  '/me/profile-picture',
  authenticate,
  upload.single('file'),
  updateProfilePicture,
);

export default accountRouter;
