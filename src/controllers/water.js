import {
  getAllWater,
  createWaterValue,
  changeWaterValue,
  deleteWaterValue,
} from '../services/water.js';
import createHttpError from 'http-errors';

export const getWaterController = async (req, res, next) => {
  const water = await getAllWater();

  res.json({
    message: 'Get all value of water',
    data: water,
  });
};

export const createWaterController = async (req, res) => {
  const water = await createWaterValue(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a water value',
    data: water,
  });
};

export const changeWaterValueController = async (req, res, next) => {
  const { waterId } = req.params;
  const userId = req.user._id;

  const result = await changeWaterValue(waterId, userId, { ...req.body });

  if (!result.water) {
    next(createHttpError(404, 'Water not found'));
    return;
  }

  res.json({
    status: 200,
    message: 'Successfully change water value',
    data: result.water,
  });
};

export const deleteWaterValueController = async (req, res, next) => {
  const { waterId } = req.params;
  const userId = req.user._id;
  const water = await deleteWaterValue(waterId, userId);

  if (!water) {
    next(createHttpError(404, 'Water not found'));
    return;
  }

  res.sendStatus(204);
};
