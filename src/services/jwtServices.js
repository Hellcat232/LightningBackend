import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/HttpError.js';

export const signToken = (userId, secretKey, expiresIn) => {
  return jwt.sign({ userId }, secretKey, { expiresIn });
};

export const checkToken = (token, key) => {
  if (!token) {
    throw new HttpError(401, 'Token is required');
  }
  try {
    // Пытаемся декодировать токен и извлечь идентификатор пользователя
    const decoded = jwt.verify(token, key);
    const userId = decoded.userId;

    if (!userId) {
      throw new HttpError(401, 'Invalid token payload');
    }

    return userId;
  } catch (err) {
    console.error('Token verification error:', err);
    throw new HttpError(401, 'Unauthorized');
  }
};
