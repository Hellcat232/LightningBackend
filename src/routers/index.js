import { Router } from 'express';
import waterRouter from './water.js';
import userRouter from './user.js';

const router = Router();

router.use('/user', userRouter);
router.use('/water', waterRouter);

export default router;
