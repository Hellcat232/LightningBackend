import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/HttpError.js';

// Создание JWT токена
export const signToken = (id, key, expiresIn) =>
  jwt.sign({ id }, key, {
    expiresIn,
  });

// Проверка и декодирование JWT токена
export const checkToken = (token, key) => {
  if (!token) {
    throw HttpError(401, 'Unauthorized');
  }
  try {
    // Пытаемся декодировать токен и извлечь идентификатор пользователя
    const { id } = jwt.verify(token, key);

    return id;
  } catch (err) {
    console.log(err);
    throw HttpError(401, 'Unauthorized');
  }
};
