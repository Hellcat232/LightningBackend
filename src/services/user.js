import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UserCollection } from '../db/user.js';
import createHttpError from 'http-errors';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/dateRegex.js';
import { SessionCollection } from '../db/session.js';

export const registerUser = async (userData) => {
  const user = await UserCollection.findOne({ email: userData.email });

  if (user) {
    throw createHttpError(409, 'Email in use');
  }

  const encryptedPassword = await bcrypt.hash(userData.password, 10);
  return await UserCollection.create({
    ...userData,
    password: encryptedPassword,
  });
};

export const loginUser = async (userData) => {
  const user = await UserCollection.findOne({ email: userData.email });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const isSamePass = await bcrypt.compare(userData.password, user.password);

  if (!isSamePass) {
    throw createHttpError(401, 'Unauthorizade');
  }

  await SessionCollection.deleteOne({ userId: user._id });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return await SessionCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  });
};
