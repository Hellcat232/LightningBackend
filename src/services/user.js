import { User } from '../db/user.js';
import { SessionsCollection } from '../db/session.js';
import { generateSessionId } from '../utils/generateSessionId.js';
import { signToken } from './jwtServices.js';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { HttpError } from '../utils/HttpError.js';

// Check if user exists
export const checkUserExistsService = (filter) => {
  return User.exists(filter);
};

// Register a new user
export const registerUser = async (userData) => {
  const email = userData.email;
  let name = email.split('@')[0];
  name = name.charAt(0).toUpperCase() + name.slice(1);

  userData.name = name;
  userData.sessionId = generateSessionId();
  const newUser = await User.create(userData);

  return { newUser };
};

export const loginUserService = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw createHttpError(401, 'Email or password is wrong');

  const passwordIsValid = await bcrypt.compare(password, user.password);
  if (!passwordIsValid)
    throw createHttpError(401, 'Email or password is wrong');

  // Remove all previous sessions
  await SessionsCollection.deleteMany({ userId: user._id });

  const accessToken = signToken(
    user._id,
    process.env.ACCESS_SECRET_KEY,
    process.env.ACCESS_EXPIRES_IN,
  );
  const refreshToken = signToken(
    user._id,
    process.env.REFRESH_SECRET_KEY,
    process.env.REFRESH_EXPIRES_IN,
  );

  const sessionId = generateSessionId();

  await SessionsCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    sessionId,
  });

  return {
    user,
    accessToken,
    refreshToken,
    sessionId,
  };
};
// Get user by ID
export const getUserByIdService = (id) => {
  return User.findById(id);
};

// Log out user
// Log out user
export const logoutUserService = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new HttpError('Unauthorized', 401);
    }

    // Очистка всех сессий пользователя
    await SessionsCollection.deleteMany({ userId });

    // Дополнительно очищаем токены у пользователя (если это необходимо)
    user.accessToken = null;
    user.refreshToken = null;

    await user.save();
  } catch (error) {
    console.error('Error during logout:', error);
    throw new HttpError('Internal server error', 500);
  }
};


// Update user data
export const updateUserService = async (userId, payload, options = {}) => {
  // Remove properties from payload if undefined or empty
  Object.keys(payload).forEach(
    (key) =>
      (payload[key] === undefined || payload[key] === '') &&
      delete payload[key],
  );

  // Find and update user by ID
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
