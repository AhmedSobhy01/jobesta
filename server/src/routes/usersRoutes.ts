import router from 'express';
import { getUser, updateUser } from '../controllers/usersController';
import { authenticate } from '../middlewares/authMiddleware';

const usersRouter = router();

usersRouter.get('/me', authenticate, getUser);

usersRouter.put('/me', authenticate, updateUser);

export default usersRouter;
