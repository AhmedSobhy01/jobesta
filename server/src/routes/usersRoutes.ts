import router from 'express';
import { getUser, updateUser } from '../controllers/usersController.js';
import { authenticate } from '../middlewares/authenticate.js';

const usersRouter = router();

usersRouter.get('/me', authenticate, getUser);

usersRouter.put('/me', authenticate, updateUser);

export default usersRouter;
