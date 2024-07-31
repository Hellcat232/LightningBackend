import { Types } from 'mongoose';
import { HttpError } from '../utils/HttpError.js';
import { checkWaterValidator } from '../schemas/waterValidator.js';
import { dateNormalizer, localDate } from '../services/water.js';
import { getWaterRecordIdService } from '../services/water.js';

export const checkWaterDataMiddleware = (req, res, next) => {
  try {
    const { value, err } = checkWaterValidator(req.body);
    if (err) throw new HttpError(400, 'Bad Request', err);

    console.log(value);

    if (value.localDate) {
      const localDate = dateNormalizer(value.localDate);
      req.body = { ...value, localDate };
      return next();
    }

    req.body = { ...value, localDate: localDate() };
    next();
  } catch (e) {
    next(e);
  }
};

export const checkIdMiddleware = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isIdValid = Types.ObjectId.isValid(id);
    if (!isIdValid) throw new HttpError(404, 'Not Found');

    const waterRecord = await getWaterRecordIdService(id);

    if (!waterRecord || waterRecord.owner.toString() !== req.user.id)
      throw new HttpError(404, 'Not Found');

    req.water = waterRecord;
    next();
  } catch (e) {
    next(e);
  }
};

export const checkAllWaterDataMiddleware = async (req, res, next) => {
  try {
    const localDate = req.body.localDate || req.query.localDate;
    console.log('localDate from request:', localDate);
    if (!localDate) {
      throw new HttpError(400, 'localDate is required');
    }

    req.body.localDate = localDate;
    next();
  } catch (e) {
    next(e);
  }
};
