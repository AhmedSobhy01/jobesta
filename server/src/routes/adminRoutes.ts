import router from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { checkIfAdmin } from '../middlewares/adminMiddleware.js';
import categoriesRouter from './adminRoutes/categoriesRoutes.js';
import badgesRouter from './adminRoutes/badgesRoutes.js';
import accountsRouter from './adminRoutes/accountsRoutes.js';
import { getStatistics } from '../controllers/adminControllers/statisticsController.js';
import jobsRouter from './adminRoutes/jobRoutes.js';
import proposalRouter from './adminRoutes/proposalRoutes.js';
import withdrawalRoutes from './adminRoutes/withdrawalsRoutes.js';

const adminRoutes = router();

adminRoutes.use(authenticate, checkIfAdmin);

adminRoutes.use('/categories', categoriesRouter);
adminRoutes.use('/badges', badgesRouter);
adminRoutes.use('/accounts', accountsRouter);
adminRoutes.get('/statistics', getStatistics);
adminRoutes.use('/jobs', jobsRouter);
adminRoutes.use('/proposals', proposalRouter);
adminRoutes.use('/withdrawals', withdrawalRoutes);

export default adminRoutes;
