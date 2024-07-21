import {
  getMonthWaterService,
  addWaterService,
  getDayWaterService,
  updateWaterRecordIdService,
  deleteWaterRecordIdService,
  getMonthWaterServiceForFront,
} from '../services/water.js';

export const addWaterController = async (req, res, next) => {
  try {
    console.log(req.body);
    const waterRecord = await addWaterService(req.body, req.user);

    res.status(201).json({
      msg: 'CREATED!',
      waterRecord: {
        _id: waterRecord.id,
        localMonth: waterRecord.localMonth,
        localDate: waterRecord.localDate,
        localTime: waterRecord.localTime,
        waterValue: waterRecord.waterValue,
        owner: waterRecord.owner,
      },
    });
  } catch (e) {
    next(e);
  }
};

export const deleteWaterController = async (req, res, next) => {
  try {
    const waterRecord = await deleteWaterRecordIdService(req.water.id);

    res.status(200).json({
      msg: 'DELETED!',
      waterRecord: {
        _id: waterRecord.id,
        localMonth: waterRecord.localMonth,
        localDate: waterRecord.localDate,
        localTime: waterRecord.localTime,
        waterValue: waterRecord.waterValue,
        owner: waterRecord.owner,
      },
    });
  } catch (e) {
    next(e);
  }
};

export const updateWaterController = async (req, res, next) => {
  try {
    const waterRecord = await updateWaterRecordIdService(
      req.water.id,
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
        owner: waterRecord.owner,
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
      req.user,
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
    const allWaterRecord = await getMonthWaterService(req.body, req.user);

    res.status(200).json({
      msg: 'GETED!',
      waterRecord: allWaterRecord,
    });
  } catch (e) {
    next(e);
  }
};
export const getMonthWaterForFrontController = async (req, res, next) => {
  try {
    const owner = req.user;
    const date = req.body;

    const { sortedResult, totalWaterDrunk } =
      await getMonthWaterServiceForFront(date, owner);

    res.status(200).json({
      msg: 'Monthly water data retrieved!',
      waterRecord: sortedResult,
      totalWaterDrunk,
    });
  } catch (e) {
    next(e);
  }
};
