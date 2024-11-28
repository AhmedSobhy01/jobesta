import router from 'express';
import {
  registerAccount,
  loginAccount,
  generateRefreshToken,
} from '../controllers/authController.js';

const authRouter = router();

authRouter.post('/register', registerAccount);

authRouter.post('/login', loginAccount);

authRouter.post('/refresh', generateRefreshToken);

export default authRouter;
