import { Water } from '../db/water.js';

export const getAllWater = async () => await Water.find();

export const createWaterValue = async (waterData) =>
  await Water.create(waterData);

export const changeWaterValue = async (waterId, userId, waterData) => {
  const result = await Water.findOneAndUpdate(
    {
      _id: waterId,
      userId: userId,
    },
    waterData,
    {
      new: true,
      includeResultMetadata: true,
    },
  );

  if (!result || !result.value) return null;

  return {
    water: result.value,
    isNew: Boolean(result?.lastErrorObject?.upserted),
  };
};

export const deleteWaterValue = (waterId) =>
  Water.findOneAndDelete({ _id: waterId });
