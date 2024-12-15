import router from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../controllers/adminControllers/categoriesController.js';
import {
  createCategoryValidationRules,
  deleteCategoryValidationRules,
} from '../../validations/adminValidations/categoriesValidation.js';
import { validateRequest } from '../../middlewares/validationMiddleware.js';
const categoriesRouter = router();

categoriesRouter.get('/', getCategories);

categoriesRouter.post(
  '/',
  createCategoryValidationRules,
  validateRequest,
  createCategory,
);

categoriesRouter.put(
  '/:id',
  createCategoryValidationRules,
  validateRequest,
  updateCategory,
);

categoriesRouter.delete(
  '/:id',
  deleteCategoryValidationRules,
  validateRequest,
  deleteCategory,
);

export default categoriesRouter;
