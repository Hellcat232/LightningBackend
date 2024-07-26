
import { checkToken, signToken } from '../services/jwtServices.js';
import {
  checkUserExistsService,
  getUserByIdService,
} from '../services/user.js';
import { HttpError } from '../utils/HttpError.js';
import { catchAsync } from '../utils/catchAsync.js';
import {
  registerUserSchema,
  loginUserSchema,
  refreshUserValidator,
  updateUserValidator,
} from '../schemas/userValidator.js';
import { generateSessionId } from '../utils/generateSessionId.js';
import { SessionsCollection } from '../db/session.js';

// Middleware для проверки данных при регистрации пользователя
export const checkCreateUserData = catchAsync(async (req, res, next) => {
  const { value, err } = registerUserSchema(req.body);

  if (err) throw HttpError(401, 'Invalid user data..', err);

  const userExists = await checkUserExistsService({ email: value.email });

  if (userExists) throw HttpError(409, 'Email in use');

  req.body = value;

  next();
});

// Middleware для проверки данных при логине
export const checkLogInData = (req, res, next) => {
  const { value, err } = loginUserSchema(req.body);

  if (err) throw HttpError(401, 'Unauthorized');

  req.body = value;

  next();
};

// Middleware для защиты маршрутов, требующих авторизации
export const protect = catchAsync(async (req, res, next) => {
  const token =
    req.headers.authorization?.startsWith('Bearer ') &&
    req.headers.authorization.split(' ')[1];

  const userId = checkToken(token, process.env.ACCESS_SECRET_KEY);

  if (!userId) throw HttpError(401, 'Unauthorized');

  const currentUser = await getUserByIdService(userId);

  if (!currentUser) throw HttpError(401, 'Unauthorized');

  req.user = currentUser;
  req.userId = userId;

  next();
});

// Middleware для проверки данных при обновлении пользователя
export const checkUpdateUserData = (req, res, next) => {
  const { value, err } = updateUserValidator(req.body);

  if (err) {
    throw HttpError(400, 'Invalid user data', err);
  }

  next();
};

// Middleware для проверки данных при обновлении токенов
export const checkRefreshData = (req, res, next) => {
  const { value, err } = refreshUserValidator(req.body);

  if (err) {
    throw HttpError(403, 'Token invalid', err);
  }

  next();
};

// Middleware для обновления данных пользователя и токенов
export const refreshUserData = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  // Verify the refresh token and get user ID
  const userId = checkToken(refreshToken, process.env.REFRESH_SECRET_KEY);

  if (!userId) throw HttpError(403, 'Token invalid');

  const currentUser = await getUserByIdService(userId);

  if (!currentUser) throw HttpError(403, 'User not found');

  // Generate new tokens
  const newAccessToken = signToken(
    currentUser._id,
    process.env.ACCESS_SECRET_KEY,
    process.env.ACCESS_EXPIRES_IN,
  );

  const newRefreshToken = signToken(
    currentUser._id,
    process.env.REFRESH_SECRET_KEY,
    process.env.REFRESH_EXPIRES_IN,
  );

  // Generate a new session ID
  const newSessionId = generateSessionId();

  // Update or create a new session in the database
  await SessionsCollection.updateOne(
    { userId: currentUser._id },
    {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      refreshTokenValidUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      sessionId: newSessionId,
    },
    { upsert: true },
  );

  // Attach the new session ID, tokens, and user data to the response
  res.status(200).json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionId: newSessionId,
    user: {
      name: currentUser.name,
      email: currentUser.email,
      gender: currentUser.gender,
      avatar: currentUser.avatar,
      weight: currentUser.weight,
      sportsActivity: currentUser.sportsActivity,
      waterRate: currentUser.waterRate,
    },
  });
});
