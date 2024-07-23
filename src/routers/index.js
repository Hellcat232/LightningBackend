import { Router } from 'express';
import waterRouter from './water.js';
import usersRouter from './user.js';
import authRouter from './auth.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/user', usersRouter);
router.use('/water', waterRouter);

export default router;
