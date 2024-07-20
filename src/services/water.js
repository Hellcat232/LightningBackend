import mongoose from 'mongoose';
import { Water } from '../db/water.js';
export const localDate = () => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};
export const localTime = () => {
  const time = new Date();
  return time.toTimeString().split(' ')[0].slice(0, 5);
};
export const dateNormalizer = (dateValue) => {
  return dateValue.split(/[\\/.\-]/).join('.');
};
export const addWaterService = async (waterData, owner) => {
  try {

    if (!waterData || !owner || !owner.id) {
      throw new Error('Invalid input data');
    }

    const ownerId = new mongoose.Types.ObjectId(owner.id);

    if (
      typeof waterData.localDate !== 'string' ||
      waterData.localDate.length < 7
    ) {
      throw new Error('Invalid date format');
    }

    const localMonth = waterData.localDate.slice(3, 5);

    const waterRecord = await Water.create({
      ...waterData,
      localMonth,
      owner: ownerId,
    });

    return waterRecord;
  } catch (e) {
    console.error('Error in addWaterService:', e);
    throw e;
  }
};

export const getWaterRecordIdService = async (id) => {
  try {
    const waterRecord = await Water.findById(id);
    return waterRecord;
  } catch (e) {
    console.error('Error in getWaterRecordIdService:', e);
    throw e;
  }
};

export const deleteWaterRecordIdService = async (id) => {
  try {
    const waterData = await Water.findByIdAndDelete(id);
    return waterData;
  } catch (e) {
    console.error('Error in deleteWaterRecordIdService:', e);
    throw e;
  }
};

export const updateWaterRecordIdService = async (id, waterData) => {
  try {
    const localMonth = waterData.localDate.slice(3, 5);

    const waterRecord = await Water.findByIdAndUpdate(
      id,
      { ...waterData, localMonth },
      { new: true },
    );

    return waterRecord;
  } catch (e) {
    console.error('Error in updateWaterRecordIdService:', e);
    throw e;
  }
};

export const getDayWaterService = async (date, owner) => {
  try {
    const ownerId = new mongoose.Types.ObjectId(owner.id);

    const allWaterRecord = await Water.find({
      owner: ownerId,
      localDate: date.localDate,
    });

    let totalDay = 0;
    allWaterRecord.forEach((i) => (totalDay += i.waterValue));

    const waterRate = Number(owner.waterRate) * 1000;
    const completed = totalDay >= waterRate;
    const feasibility = (totalDay / waterRate) * 100;

    return {
      allWaterRecord,
      feasibility: completed ? 100 : feasibility,
      completed,
    };
  } catch (e) {
    console.error('Error in getDayWaterService:', e);
    throw e;
  }
};

export const getMonthWaterService = async (date, owner) => {
  try {
    const ownerId = new mongoose.Types.ObjectId(owner.id);

    const allWaterRecord = await Water.find({
      owner: ownerId,
      localMonth: date.localDate.slice(3, 5),
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
    const sortedResult = {};
    for (let key of sortedKeys) {
      sortedResult[key] = result[key].sort((a, b) =>
        a.localTime.localeCompare(b.localTime),
      );
    }

    return sortedResult;
  } catch (e) {
    console.error('Error in getMonthWaterService:', e);
    throw e;
  }
};

const getWeekDateRange = (localDate) => {
  const [day, month, year] = localDate.split('.').map(Number);
  const today = new Date(year, month - 1, day);

  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(today.getDate() - distanceToMonday);
  startOfWeek.setHours(0, 0, 0, 0);


  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return {
    start: startOfWeek.toISOString(),
    end: endOfWeek.toISOString(),
  };
};


export const getWeekWaterService = async (date, owner) => {
  try {
    const ownerId = new mongoose.Types.ObjectId(owner.id);
    const { start, end } = getWeekDateRange(date.localDate);

    console.log('Owner ID:', ownerId);
    console.log('Start Date:', start);
    console.log('End Date:', end);

    const allWaterRecord = await Water.find({
      owner: ownerId,
      localDate: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
    }).exec();

    console.log('All Water Records:', allWaterRecord);

    return allWaterRecord;
  } catch (e) {
    console.error('Error in getWeekWaterService:', e);
    throw e;
  }
};
