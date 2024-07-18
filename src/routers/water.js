import { Router } from 'express';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  getWaterController,
  changeWaterValueController,
  deleteWaterValueController,
  createWaterController,
} from '../controllers/water.js';

const router = Router();

router.get('/', ctrlWrapper(getWaterController));

router.post('/', ctrlWrapper(createWaterController));

router.patch('/:waterId', ctrlWrapper(changeWaterValueController));

router.delete('/:waterId', ctrlWrapper(deleteWaterValueController));

export default router;
