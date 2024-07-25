import { User } from '../db/user.js'; // Импорт модели пользователя

export const checkSessionId = async (req, res, next) => {
  const sessionId = req.cookies.sessionId;

  if (!sessionId) {
    return next(); // Пропускаем, если нет sessionId
  }

  try {
    const user = await User.findOne({ sessionId });

    if (!user) {
      return next(); // Если пользователь не найден, пропускаем
    }

    req.user = user; // Добавляем пользователя в запрос
    req.userId = user._id; // Добавляем userId в запрос

    next(); // Переходим к следующему middleware
  } catch (error) {
    next(error); // Обработка ошибок
  }
};
