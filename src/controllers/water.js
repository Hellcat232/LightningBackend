import { addWaterService } from '../services/water.js';
import { getDayWaterService } from '../services/water.js';
import { getMonthWaterService } from '../services/water.js';
import { updateWaterRecordIdService } from '../services/water.js';
import { deleteWaterRecordIdService } from '../services/water.js';

export const addWaterController = async (req, res, next) => {
  try {
    console.log('Request Body:', req.body);
    const waterRecord = await addWaterService(req.body);

    res.status(201).json({
      msg: 'CREATED!',
      waterRecord: {
        _id: waterRecord.id,
        localMonth: waterRecord.localMonth,
        localDate: waterRecord.localDate,
        localTime: waterRecord.localTime,
        waterValue: waterRecord.waterValue,
      },
    });
  } catch (e) {
    console.error('Error in addWaterController:', e);
    next(e);
  }
};

export const deleteWaterController = async (req, res, next) => {
  try {
    const waterRecord = await deleteWaterRecordIdService(req.params.id);

    res.status(200).json({
      msg: 'DELETED!',
      waterRecord: {
        _id: waterRecord.id,
        localMonth: waterRecord.localMonth,
        localDate: waterRecord.localDate,
        localTime: waterRecord.localTime,
        waterValue: waterRecord.waterValue,
      },
    });
  } catch (e) {
    next(e);
  }
};

export const updateWaterController = async (req, res, next) => {
  try {
    const waterRecord = await updateWaterRecordIdService(
      req.params.id,
      req.body,
    );

    res.status(201).json({
      msg: 'UPDATED!',
      waterRecord: {
        _id: waterRecord.id,
        localMonth: waterRecord.localMonth,
        localDate: waterRecord.localDate,
        localTime: waterRecord.localTime,
        waterValue: waterRecord.waterValue,
      },
    });
  } catch (e) {
    next(e);
  }
};

export const getDayWaterController = async (req, res, next) => {
  try {
    const { allWaterRecord, feasibility, completed } = await getDayWaterService(
      req.body,
    );

    res.status(200).json({
      msg: 'GETED!',
      waterRate: {
        feasibility,
        completed,
      },
      waterRecord: allWaterRecord,
    });
  } catch (e) {
    next(e);
  }
};

export const getMonthWaterController = async (req, res, next) => {
  try {
    const allWaterRecord = await getMonthWaterService(req.body);

    res.status(200).json({
      msg: 'GETED!',
      waterRecord: allWaterRecord,
    });
  } catch (e) {
    next(e);
  }
};
