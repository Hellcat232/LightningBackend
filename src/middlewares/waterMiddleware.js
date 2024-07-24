import { Types } from 'mongoose';

import { HttpError } from '../utils/HttpError.js';
import { checkWaterValidator } from '../schemas/waterValidator.js';
import { checkAllWaterValidator } from '../schemas/waterValidator.js';
import { dateNormalizer } from '../services/water.js';
import { localDate } from '../services/water.js';
import { getWaterRecordIdService } from '../services/water.js';

export const checkWaterDataMiddleware = (req, res, next) => {
  try {
    // Валидация данных воды
    const { value, err } = checkWaterValidator(req.body);
    if (err) throw HttpError(400, 'Bad Request', err);

    console.log(value);

    // Нормализация даты, если она присутствует
    if (value.localDate) {
      const localDate = dateNormalizer(value.localDate);
      req.body = { ...value, localDate };
      return next();
    }

    // Установка текущей даты, если она не предоставлена
    req.body = { ...value, localDate: localDate() };

    next();
  } catch (e) {
    next(e);
  }
};

export const checkIdMiddleware = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Проверка валидности ID
    const isIdValid = Types.ObjectId.isValid(id);
    if (!isIdValid) throw HttpError(404, 'Not Found');

    // Проверка существования записи о воде и права доступа
    const waterRecord = await getWaterRecordIdService(id);

    if (!waterRecord || waterRecord.owner.toString() !== req.user.id)
      throw HttpError(404, 'Not Found');

    req.water = waterRecord;

    next();
  } catch (e) {
    next(e);
  }
};

export const checkAllWaterDataMiddleware = async (req, res, next) => {
  try {
    const { value, error } = checkAllWaterValidator(req.body);
    if (error) {
      return next(HttpError(400, 'Bad Request', error.details));
    }

    if (value.localDate) {
      req.body.localDate = dateNormalizer(value.localDate);
    } else {
      req.body.localDate = localDate();
    }

    next();
  } catch (e) {
    next(e);
  }
};
