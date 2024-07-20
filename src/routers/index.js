import { Router } from 'express';
import waterRouter from './water.js';
import usersRouter from './user.js';

const router = Router();

router.use('/user', usersRouter);
router.use('/water', waterRouter);

export default router;
