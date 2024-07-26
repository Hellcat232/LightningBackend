import {
  getMonthWaterService,
  addWaterService,
  getDayWaterService,
  updateWaterRecordIdService,
  deleteWaterRecordIdService,
  getMonthWaterServiceForFront,
} from '../services/water.js';

// Контроллер для добавления записи о воде
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
    console.error(e);
    next(e);
  }
};

// Контроллер для удаления записи о воде
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

// Контроллер для обновления записи о воде
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

// Контроллер для получения дневных записей о воде
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

// Контроллер для получения месячных записей о воде
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

    // Получаем данные для фронтенда
    const { sortedResult, totalWaterDrunk } =
      await getMonthWaterServiceForFront(date, owner);

    // Формируем ответ
    res.status(200).json({
      msg: 'GETED!',
      totalWaterDrunk,
      waterRecord: sortedResult,
    });
  } catch (e) {
    next(e);
  }
};
