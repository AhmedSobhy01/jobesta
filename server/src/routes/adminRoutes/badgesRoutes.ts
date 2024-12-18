import router from 'express';
import {
  getBadges,
  updateBadge,
} from '../../controllers/adminControllers/badgesController.js';
import { updateBadgeValidationRules } from '../../validations/adminValidations/badgesValidation.js';
import { validateRequest } from '../../middlewares/validationMiddleware.js';
const badgesRouter = router();

badgesRouter.get('/', getBadges);

badgesRouter.put(
  '/:id',
  updateBadgeValidationRules,
  validateRequest,
  updateBadge,
);

export default badgesRouter;
