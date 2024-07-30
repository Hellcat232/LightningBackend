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
  const parts = dateValue.split(/[\\/.\-]/);
  if (parts.length === 3) {
    return `${parts[0].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${
      parts[2]
    }`;
  } else if (parts.length === 2) {
    return `${parts[0].padStart(2, '0')}.${parts[1]}`;
  } else {
    throw new Error('Invalid date format');
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
  const updatedRecord = await Water.findByIdAndUpdate(
    id,
    { ...waterData, localDate: normalizedDate, localMonth },
    { new: true },
  );
  return updatedRecord;
};

export const getDayWaterService = async (date, owner) => {
  try {
    const normalizedDate = dateNormalizer(date.localDate);
    const allWaterRecord = await Water.find({
      owner: owner.id,
      localDate: normalizedDate,
    });

    // Ensure the updated records are included in the result
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
    const isMonthOnly = normalizedDate.length === 7; // e.g., "03.2024"

    let query = {
      owner: owner.id,
    };

    if (isMonthOnly) {
      query.localMonth = normalizedDate;
    } else {
      query.localDate = normalizedDate;
    }

    const allWaterRecord = await Water.find(query);

    const dailyGoal = Number(owner.waterRate) * 1000;
    const totalWaterDrunk = allWaterRecord.reduce(
      (sum, record) => sum + (record.waterValue || 0),
      0,
    );

    const result = allWaterRecord.reduce((acc, item) => {
      const key = item.localDate;
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += item.waterValue || 0;
      return acc;
    }, {});

    const sortedKeys = Object.keys(result).sort();
    const sortedResult = sortedKeys.map((key) => {
      const dailyTotal = result[key];
      const feasibility = Math.min(
        100,
        Math.ceil((dailyTotal / dailyGoal) * 100),
      );
      const completed = dailyTotal >= dailyGoal;

      return {
        localDate: key,
        dailyTotal: Math.ceil(dailyTotal),
        feasibility,
        completed,
      };
    });

    return {
      sortedResult,
      totalWaterDrunk: Math.ceil(totalWaterDrunk),
    };
  } catch (e) {
    console.error('Error fetching month water data', e);
    throw e;
  }
};
