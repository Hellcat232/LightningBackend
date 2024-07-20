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
import { protect } from '../middlewares/userMiddleware.js';

const waterRouter = Router();

waterRouter.use(protect);
waterRouter.post('/day', checkWaterDataMiddleware, addWaterController);
waterRouter.use('/day/:id', checkIdMiddleware);
waterRouter
  .route('/day/:id')
  .put(checkWaterDataMiddleware, updateWaterController)
  .patch(checkWaterDataMiddleware, updateWaterController)
  .delete(deleteWaterController);
waterRouter.post(
  '/fullDay',
  checkAllWaterDataMiddleware,
  getDayWaterController,
);
waterRouter.post(
  '/fullMonth',
  checkAllWaterDataMiddleware,
  getMonthWaterController,
);
export default waterRouter;
