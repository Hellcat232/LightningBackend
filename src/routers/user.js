import { Router } from 'express';
import {
  checkCreateUserData,
  checkLogInData,
  checkRefreshData,
  checkUpdateUserData,
  protect,
  refreshUserData,
} from '../middlewares/userMiddleware.js';
import {
  createUser,
  currentUser,
  loginUser,
  logoutUser,
  refreshUser,
  updateUser,
} from '../controllers/user.js';
import { upload } from '../middlewares/multer.js';

const usersRouter = Router();

usersRouter.post('/register', checkCreateUserData, createUser);
usersRouter.post('/login', checkLogInData, loginUser);
usersRouter.get('/logout', protect, logoutUser);
usersRouter.post('/refresh', checkRefreshData, refreshUserData, refreshUser);
usersRouter.get('/current', protect, currentUser);
usersRouter.put('/update', upload.single('avatar'), protect, checkUpdateUserData, updateUser);

export default usersRouter;
