import Joi from 'joi';

import { joiValidator } from '../utils/joiValidator.js';
import { DATE_REGEX } from '../constants/dateRegex.js';
import { TIME_REGEX } from '../constants/dateRegex.js';

export const checkWaterValidator = joiValidator((data) =>
  Joi.object()
    .options({ abortEarly: false })
    .keys({
      localDate: Joi.string().pattern(new RegExp(DATE_REGEX)).length(10),
      localTime: Joi.string().pattern(new RegExp(TIME_REGEX)).length(5),
      waterValue: Joi.number().required(),
    })
    .validate(data),
);

export const checkAllWaterValidator = joiValidator((data) => {
  const schema = Joi.object({
    localDate: Joi.string().pattern(new RegExp(DATE_REGEX)).length(10),
    waterRate: Joi.object({
      feasibility: Joi.number().required(),
      completed: Joi.boolean().required(),
    }).required(),
  }).options({ abortEarly: false });

  return schema.validate(data);
});



