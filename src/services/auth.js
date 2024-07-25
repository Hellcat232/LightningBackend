import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { User } from '../db/user.js';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/auth.js';
import { SessionsCollection } from '../db/session.js';
import jwt from 'jsonwebtoken';

// Генерация токенов с использованием jwt
const generateToken = (userId, secretKey, expiresIn) => {
  return jwt.sign({ userId }, secretKey, { expiresIn });
};

// Создание новой сессии
const createSession = () => {
  const accessToken = generateToken(
    user._id.toString(),
    process.env.ACCESS_SECRET_KEY,
    FIFTEEN_MINUTES / 1000, // jwt требует время в секундах
  );
  const refreshToken = generateToken(
    user._id.toString(),
    process.env.REFRESH_SECRET_KEY,
    ONE_DAY / 1000, // jwt требует время в секундах
  );

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  };
};

// Логин пользователя
export const loginUser = async (payload) => {
  const user = await User.findOne({ email: payload.email });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordValid) {
    throw createHttpError(401, 'Unauthorized');
  }

  // Удаление старых сессий
  await SessionsCollection.deleteMany({ userId: user._id });

  // Создание новой сессии
  const newSession = createSession();

  return await SessionsCollection.create({
    userId: user._id,
    ...newSession,
  });
};

// Обновление сессии
export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  // Создание новой сессии
  const newSession = createSession();

  // Удаление старой сессии
  await SessionsCollection.deleteOne({ _id: sessionId });

  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};
