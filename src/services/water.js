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

export const dateNormalizer = (dateValue) => {
  const arr = dateValue.split(/[\\/.\-]/).join('.');

  return arr;
};

export const addWaterService = async (waterData) => {
  try {
    console.log('Service input:', waterData);
    const localMonth = waterData.localDate.slice(3);
    const waterRecord = await Water.create({ ...waterData, localMonth });
    console.log('Service output:', waterRecord);
    return waterRecord;
  } catch (e) {
    console.error('Error in addWaterService:', e);
    throw e;
  }
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
  const localMonth = waterData.localDate.slice(3);

  const waterRecord = await Water.findByIdAndUpdate(
    id,
    { ...waterData, localMonth },
    { new: true },
  );

  return waterRecord;
};

export const getDayWaterService = async (date) => {
  const allWaterRecord = await Water.find({
    localDate: date.localDate,
  });

  let totalDay = 0;
  allWaterRecord.forEach((i) => (totalDay += i.waterValue));

  return { allWaterRecord, totalDay };
};

export const getMonthWaterService = async (date) => {
  const allWaterRecord = await Water.find({
    localMonth: date.localDate.slice(3),
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
    sortedResult[key] = result[key].sort((a, b) => {
      return a.localTime.localeCompare(b.localTime);
    });
  }

  return sortedResult;
};
