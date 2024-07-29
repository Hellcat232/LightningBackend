import {
  getMonthWaterService,
  addWaterService,
  getDayWaterService,
  updateWaterRecordIdService,
  deleteWaterRecordIdService,
  getMonthWaterServiceForFront,
  dateNormalizer,
} from '../services/water.js';

export const addWaterController = async (req, res, next) => {
  try {
    console.log(req.body);
    const normalizedDate = dateNormalizer(req.body.localDate);
    const waterRecord = await addWaterService(
      { ...req.body, localDate: normalizedDate },
      req.user,
    );

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
    console.error(e);
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
    const normalizedDate = dateNormalizer(req.body.localDate);
    const waterRecord = await updateWaterRecordIdService(req.water.id, {
      ...req.body,
      localDate: normalizedDate,
    });

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
    const normalizedDate = dateNormalizer(
      req.query.localDate || req.body.localDate,
    );
    const waterRecord = await getDayWaterService(
      { localDate: normalizedDate },
      req.user,
    );

    res.status(200).json({
      msg: 'GETED!',
      ...waterRecord,
    });
  } catch (e) {
    next(e);
  }
};

export const getMonthWaterController = async (req, res, next) => {
  try {
    const normalizedDate = dateNormalizer(
      req.query.localDate || req.body.localDate,
    );
    const waterRecord = await getMonthWaterService(
      { localDate: normalizedDate },
      req.user,
    );

    res.status(200).json({
      msg: 'GETED!',
      ...waterRecord,
    });
  } catch (e) {
    next(e);
  }
};

export const getMonthWaterForFrontController = async (req, res, next) => {
  try {
    const owner = req.user;
    const date = req.body.localDate || req.query.localDate;
    if (!date) {
      throw new Error('localDate is required');
    }

    const { sortedResult, totalWaterDrunk } =
      await getMonthWaterServiceForFront({ localDate: date }, owner);

    res.status(200).json({
      msg: 'GETED!',
      totalWaterDrunk,
      sortedResult,
    });
  } catch (e) {
    console.error('Error in getMonthWaterForFrontController:', e);
    next(e);
  }
};



export const getFullWaterController = async (req, res, next) => {
  try {
    const owner = req.user;
    const date = req.query.localDate || req.body.localDate;
    if (!date) {
      throw new Error('localDate is required');
    }

    const normalizedDate = dateNormalizer(date);

    const dayWaterData = await getDayWaterService(
      { localDate: normalizedDate },
      owner,
    );

    const { sortedResult, totalWaterDrunk } =
      await getMonthWaterServiceForFront({ localDate: normalizedDate }, owner);

    res.status(200).json({
      msg: 'GETED!',
      dayWaterData,
      monthWaterData: {
        sortedResult,
        totalWaterDrunk,
      },
    });
  } catch (e) {
    console.error('Error in getFullWaterController:', e);
    next(e);
  }
};
