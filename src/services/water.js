import mongoose from 'mongoose';
import { Water } from '../db/water.js';

// Получает текущую локальную дату в формате строки
export const localDate = () => {
  const milliseconds = Date.now();
  const date = new Date(milliseconds);

  return date.toLocaleDateString();
};

// Получает текущие часы и минуты в локальном формате времени

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

// Преобразует дату в строковом формате, разделенную различными символами (/, \, ., -), в формат с точками

export const dateNormalizer = (dateValue) => {
  const arr = dateValue.split(/[\\/.\-]/).join('.');

  return arr;
};

//=================================================================================
// Создает новую запись о потреблении воды в базе данных, добавляя текущий месяц (вычисленный из localDate)
export const addWaterService = async (waterData, owner) => {
  const localMonth = waterData.localDate.slice(3);

  const waterRecord = await Water.create({ ...waterData, localMonth, owner });

  return waterRecord;
};
// Находит и возвращает запись о потреблении воды по идентификатору
export const getWaterRecordIdService = async (id) => {
  const waterRecord = await Water.findById(id);

  return waterRecord;
};
// Удаляет запись о потреблении воды по идентификатору и возвращает удаленные данные
export const deleteWaterRecordIdService = async (id) => {
  const waterData = await Water.findByIdAndDelete(id);

  return waterData;
};
// Обновляет запись о потреблении воды по идентификатору, добавляя или изменяя месяц
export const updateWaterRecordIdService = async (id, waterData) => {
  const localMonth = waterData.localDate.slice(3);

  const waterRecord = await Water.findByIdAndUpdate(
    id,
    { ...waterData, localMonth },
    { new: true },
  );

  return waterRecord;
};
// Получает все записи о потреблении воды за конкретный день для конкретного владельца, вычисляет общее количество воды и проверяет, достигнут ли дневной норматив
export const getDayWaterService = async (date, owner) => {
  const allWaterRecord = await Water.find({
    owner: owner.id,
    localDate: date.localDate,
  });

  let totalDay = 0;
  allWaterRecord.forEach((i) => (totalDay += i.waterValue));

  if (totalDay >= Number(owner.waterRate) * 1000)
    return { allWaterRecord, feasibility: 100, completed: true };

  const feasibility = (totalDay / (Number(owner.waterRate) * 1000)) * 100;
  return { allWaterRecord, feasibility, completed: false };
};
// Получает все записи о потреблении воды за месяц, группирует их по дате и сортирует по времени в пределах каждой даты
export const getMonthWaterService = async (date, owner) => {
  const allWaterRecord = await Water.find({
    owner: owner.id,
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
// Получает все записи о потреблении воды за месяц, группирует их по дате и сортирует по времени. Дополнительно вычисляет общее количество потребленной воды за месяц и возвращает это вместе с отсортированными записями
export const getMonthWaterServiceForFront = async (date, owner) => {
  const allWaterRecord = await Water.find({
    owner: owner.id,
    localMonth: date.localDate.slice(3),
  });

  // Группировка данных по дате
  const result = allWaterRecord.reduce((acc, item) => {
    let key = item.localDate;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  // Сортировка по дате и времени
  const sortedKeys = Object.keys(result).sort();
  const sortedResult = {};
  for (let key of sortedKeys) {
    sortedResult[key] = result[key].sort((a, b) => {
      return a.localTime.localeCompare(b.localTime);
    });
  }

  // Вычисление общего количества воды за месяц
  const totalWaterDrunk = allWaterRecord.reduce((sum, record) => {
    return sum + (record.waterValue || 0);
  }, 0);

  // Вычисление общего количества воды по дате
  const dailyTotals = Object.entries(sortedResult).reduce(
    (acc, [date, records]) => {
      const dailyTotal = records.reduce(
        (sum, record) => sum + (record.waterValue || 0),
        0,
      );
      acc[date] = {
        records,
        dailyTotal,
      };
      return acc;
    },
    {},
  );

  return { sortedResult: dailyTotals, totalWaterDrunk };
};
