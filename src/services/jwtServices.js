import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/HttpError.js';

export const signToken = (id, key, expiresIn) =>
  jwt.sign({ id }, key, {
    expiresIn,
  });

export const checkToken = (token, key) => {
  if (!token) {
    throw HttpError(401, 'Unauthorized');
  }
  try {
    const { id } = jwt.verify(token, key);

    return id;
  } catch (err) {
    console.log(err);
    throw HttpError(401, 'Unauthorized');
  }
};
