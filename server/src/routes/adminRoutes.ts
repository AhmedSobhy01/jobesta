import router from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
  getCategories,
  createCategory,
  deleteCategory,
  getBadges,
  deleteBadge,
} from '../controllers/adminController.js';
import { checkIfAdmin } from '../middlewares/adminMiddleware.js';
import {
  createCategoryValidationRules,
  deleteCategoryValidationRules,
} from '../validations/adminValidations.js';
import { validateRequest } from '../middlewares/validationMiddleware.js';
const adminRoutes = router();

adminRoutes.use(authenticate, checkIfAdmin);

adminRoutes.get('/categories', getCategories);

adminRoutes.post(
  '/categories',
  createCategoryValidationRules,
  validateRequest,
  createCategory,
);

adminRoutes.delete(
  '/categories/:id',
  deleteCategoryValidationRules,
  validateRequest,
  deleteCategory,
);

adminRoutes.get('/badges', getBadges);

adminRoutes.delete('/badges/:id', deleteBadge);

export default adminRoutes;
