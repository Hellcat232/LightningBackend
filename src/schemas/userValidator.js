import Joi from 'joi';
import { joiValidator } from '../utils/joiValidator.js';
import { userGender } from '../constants/userGender.js';

export const registerUserSchema = joiValidator((data) =>
  Joi.object()
    .options({ abortEarly: false })
    .keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      gender: Joi.string()
        .valid(...Object.values(userGender))
        .optional(),
    })
    .validate(data),
);

export const loginUserSchema = joiValidator((data) =>
  Joi.object()
    .options({ abortEarly: false })
    .keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    })
    .validate(data),
);

export const updateUserValidator = joiValidator((data) =>
  Joi.object()
    .options({ abortEarly: false })
    .keys({
      name: Joi.string().min(2).max(30).allow('').optional(),
      email: Joi.string().email().optional(),
      gender: Joi.string()
        .valid(...Object.values(userGender))
        .optional(),
      weight: Joi.string().allow('').optional(),
      sportsActivity: Joi.string().allow('').optional(),
      waterRate: Joi.string().allow('').optional(),
      avatar: Joi.binary().optional(),
    })
    .validate(data),
);

export const refreshUserValidator = joiValidator((data) =>
  Joi.object()
    .options({ abortEarly: false })
    .keys({
      refreshToken: Joi.string().required(),
    })
    .validate(data),
);
