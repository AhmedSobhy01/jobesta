import router from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { checkIfAdmin } from '../middlewares/adminMiddleware.js';
import categoriesRouter from './adminRoutes/categoriesRoutes.js';
import badgesRouter from './adminRoutes/badgesRoutes.js';
import accountsRouter from './adminRoutes/accountsRoutes.js';
import jobsRouter from './adminRoutes/jobRoutes.js';

const adminRoutes = router();

adminRoutes.use(authenticate, checkIfAdmin);

adminRoutes.use('/categories', categoriesRouter);
adminRoutes.use('/badges', badgesRouter);
adminRoutes.use('/accounts', accountsRouter);
adminRoutes.use('/jobs', jobsRouter);

export default adminRoutes;
