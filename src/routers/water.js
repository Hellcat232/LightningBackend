import { Router } from 'express';

import {
  addWaterController,
  getDayWaterController,
  getMonthWaterController,
  updateWaterController,
  deleteWaterController,
} from '../controllers/water.js';
import {
  checkAllWaterDataMiddleware,
  checkWaterDataMiddleware,
  checkIdMiddleware,
} from '../middlewares/waterMiddleware.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

router.post('/day', checkWaterDataMiddleware, ctrlWrapper(addWaterController));

router.use('/day/:id', checkIdMiddleware);
router
  .route('/day/:id')
  .put(checkWaterDataMiddleware, ctrlWrapper(updateWaterController))
  .patch(checkWaterDataMiddleware, ctrlWrapper(updateWaterController))
  .delete(ctrlWrapper(deleteWaterController));

router.post(
  '/fullDay',
  checkAllWaterDataMiddleware,
  ctrlWrapper(getDayWaterController),
);
router.post(
  '/fullMonth',
  checkAllWaterDataMiddleware,
  ctrlWrapper(getMonthWaterController),
);

export default router;
