import { User } from '../db/user.js';
import { HttpError } from '../utils/HttpError.js';
import { signToken } from './jwtServices.js';

// Проверяет, существует ли пользователь, соответствующий заданному фильтру
export const checkUserExistsService = (filter) => {
  return User.exists(filter);
};
// Регистрирует нового пользователя, создавая имя на основе email и сохраняя пользователя в базе данных
export const registerUser = async (userData) => {
  const email = userData.email;
  // Извлекает имя из email и делает первую букву заглавной
  let name = email.split('@')[0];

  name = name.charAt(0).toUpperCase() + name.slice(1);

  userData.name = name;
  // Создает нового пользователя в базе данных
  const newUser = await User.create(userData);

  return { newUser };
};
// Выполняет вход пользователя, проверяя правильность email и пароля, и возвращает токены
export const loginUserService = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) throw HttpError(401, 'Email or password is wrong');

  // Проверяет корректность пароля

  const passwordIsValid = await user.checkUserPassword(password, user.password);

  if (!passwordIsValid) throw HttpError(401, 'Email or password is wrong');
  // Генерирует токены для доступа и обновления
  const accessToken = signToken(
    user.id,
    process.env.ACCESS_SECRET_KEY,
    process.env.ACCESS_EXPIRES_IN,
  );

  const refreshToken = signToken(
    user.id,
    process.env.REFRESH_SECRET_KEY,
    process.env.REFRESH_EXPIRES_IN,
  );
  // Сохраняет токены в базе данных
  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
};
// Получает пользователя по идентификатору
export const getUserByIdService = (id) => {
  return User.findById(id);
};
// Выполняет выход пользователя, очищая токены доступа и обновления
export const logoutUserService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw HttpError(401, 'Unauthorized');
  }

  user.accessToken = null;
  user.refreshToken = null;

  await user.save();
};
// Обновляет данные пользователя, удаляя свойства с неопределенными или пустыми значениями
export const updateUserService = async (userId, payload, options = {}) => {
  // Удаляет свойства из payload, если их значение неопределено или пусто
  Object.keys(payload).forEach(
    (key) =>
      (payload[key] === undefined || payload[key] === '') &&
      delete payload[key],
  );
  // Находит и обновляет пользователя по идентификатору, возвращает обновленного пользователя и информацию о том, был ли он создан новый
  const rawResult = await User.findOneAndUpdate({ _id: userId }, payload, {
    new: true,
    includeResultMetadata: true,
    ...options,
  });

  if (!rawResult || !rawResult.value) return null;

  return {
    user: rawResult.value,
    isNew: Boolean(rawResult?.lastErrorObject?.upserted),
  };
};
