import router from 'express';
import {
  getBadges,
  deleteBadge,
} from '../../controllers/adminControllers/badgesController.js';
import {
	  deleteBadgeValidationRules,
} from '../../validations/adminValidations/badgesValidation.js';
import { validateRequest } from '../../middlewares/validationMiddleware.js';
const badgesRouter = router();

badgesRouter.get('/', getBadges);

badgesRouter.delete(
  '/:id',
  deleteBadgeValidationRules,
  validateRequest,
  deleteBadge,
);

export default badgesRouter;