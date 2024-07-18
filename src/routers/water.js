import { Router } from 'express';

import { addWaterController, getDayWaterController, getMonthWaterController, updateWaterController, deleteWaterController } from '../controllers/water.js';
import { checkAllWaterDataMiddleware, checkWaterDataMiddleware, checkIdMiddleware } from '../middlewares/waterMiddleware.js';

const router = Router();

router.post('/day', checkWaterDataMiddleware, addWaterController);

router.use('/day/:id', checkIdMiddleware);
router
  .route('/day/:id')
  .put(checkWaterDataMiddleware, updateWaterController)
  .patch(checkWaterDataMiddleware, updateWaterController)
  .delete(deleteWaterController);

router.post('/fullDay', checkAllWaterDataMiddleware, getDayWaterController);
router.post('/fullMonth', checkAllWaterDataMiddleware, getMonthWaterController);

export { router };
