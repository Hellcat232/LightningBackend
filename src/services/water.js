// services/water.js

import { Water } from '../db/water.js';

export const localDate = () => {
  const milliseconds = Date.now();
  const date = new Date(milliseconds);
  return date.toLocaleDateString();
};

export const localTime = () => {
  const milliseconds = Date.now();
  const time = new Date(milliseconds);
  const timeString = time
    .toLocaleTimeString()
    .split(':')
    .splice(0, 2)
    .join(':');
  return timeString;
};

<<<<<<< HEAD
// Преобразует дату в строковом формате, разделенную различными символами (/, \, ., -), в формат с точками
export const dateNormalizer = (dateString) => {
  try {
    const parsedDate = parse(dateString, 'dd-MM-yyyy', new Date());
    return format(parsedDate, 'dd.MM.yyyy');
  } catch (error) {
    console.error('Error normalizing date:', error);
    return null;
=======
export const dateNormalizer = (dateValue) => {
  const parts = dateValue.split(/[\\/.\-]/);
  if (parts.length === 3) {
    return `${parts[0].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${
      parts[2]
    }`;
  } else {
    throw new Error('Invalid date format');
>>>>>>> 4c4eb42a8f1831be30630d223f540535f9134487
  }
};

export const addWaterService = async (waterData, owner) => {
  const normalizedDate = dateNormalizer(waterData.localDate);
  const localMonth = normalizedDate.slice(3);
  const waterRecord = await Water.create({
    ...waterData,
    localDate: normalizedDate,
    localMonth,
    owner,
  });
  return waterRecord;
};

export const getWaterRecordIdService = async (id) => {
  const waterRecord = await Water.findById(id);
  return waterRecord;
};

export const deleteWaterRecordIdService = async (id) => {
  const waterData = await Water.findByIdAndDelete(id);
  return waterData;
};

export const updateWaterRecordIdService = async (id, waterData) => {
  const normalizedDate = dateNormalizer(waterData.localDate);
  const localMonth = normalizedDate.slice(3);
  const waterRecord = await Water.findByIdAndUpdate(
    id,
    { ...waterData, localDate: normalizedDate, localMonth },
    { new: true },
  );
  return waterRecord;
};

export const getDayWaterService = async (date, owner) => {
  try {
    const normalizedDate = dateNormalizer(date.localDate);
    const allWaterRecord = await Water.find({
      owner: owner.id,
      localDate: normalizedDate,
    });

    let totalDay = allWaterRecord.reduce(
      (sum, record) => sum + (record.waterValue || 0),
      0,
    );

    const dailyGoal = Number(owner.waterRate) * 1000;
    totalDay = Math.ceil(totalDay);
    const feasibility = Math.min(100, Math.ceil((totalDay / dailyGoal) * 100));
    const completed = totalDay >= dailyGoal;

    return {
      allWaterRecord,
      feasibility,
      completed,
    };
  } catch (e) {
    console.error('Error fetching day water data', e);
    throw e;
  }
};

export const getMonthWaterService = async (date, owner) => {
  try {
    const normalizedDate = dateNormalizer(date.localDate);
    const allWaterRecord = await Water.find({
      owner: owner.id,
      localMonth: normalizedDate.slice(3),
    });

    const result = allWaterRecord.reduce((acc, item) => {
      let key = item.localDate;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    const sortedKeys = Object.keys(result).sort();
    const sortedResult = sortedKeys.map((key) => {
      const records = result[key].sort((a, b) =>
        a.localTime.localeCompare(b.localTime),
      );
      const dailyTotal = records.reduce(
        (sum, record) => sum + (record.waterValue || 0),
        0,
      );
      const dailyGoal = Number(owner.waterRate) * 1000;

      return {
        localDate: key,
        records,
        dailyTotal: Math.ceil(dailyTotal),
        feasibility: Math.min(100, Math.ceil((dailyTotal / dailyGoal) * 100)),
        completed: dailyTotal >= dailyGoal,
      };
    });

    return sortedResult;
  } catch (e) {
    console.error('Error fetching month water data', e);
    throw e;
  }
};

export const getMonthWaterServiceForFront = async (date, owner) => {
  try {
    const normalizedDate = dateNormalizer(date.localDate);
    const allWaterRecord = await Water.find({
      owner: owner.id,
      localMonth: normalizedDate.slice(3),
    });

    const result = allWaterRecord.reduce((acc, item) => {
      let key = item.localDate;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    const sortedKeys = Object.keys(result).sort();
    const sortedResult = sortedKeys.map((key) => {
      const records = result[key].sort((a, b) =>
        a.localTime.localeCompare(b.localTime),
      );
      const dailyTotal = records.reduce(
        (sum, record) => sum + (record.waterValue || 0),
        0,
      );
      const dailyGoal = Number(owner.waterRate) * 1000;

      return {
        localDate: key,
        records,
        dailyTotal: Math.ceil(dailyTotal),
        feasibility: Math.min(100, Math.ceil((dailyTotal / dailyGoal) * 100)),
        completed: dailyTotal >= dailyGoal,
      };
    });

    const totalWaterDrunk = allWaterRecord.reduce(
      (sum, record) => sum + (record.waterValue || 0),
      0,
    );

    return {
      sortedResult,
      totalWaterDrunk: Math.ceil(totalWaterDrunk),
    };
  } catch (e) {
    console.error('Error fetching month water data', e);
    throw e;
  }
};
