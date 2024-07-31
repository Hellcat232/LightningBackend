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

export const checkCreateUserData = catchAsync(async (req, res, next) => {
  const { value, err } = registerUserSchema(req.body);

  if (err)
    throw new HttpError(
      401,
      'Invalid registration data. Please check your input and try again.',
      err,
    );

  const userExists = await checkUserExistsService({ email: value.email });

  if (userExists)
    throw new HttpError(
      409,
      'Email already in use. Please choose another email.',
    );

  req.body = value;
  next();
});

export const checkLogInData = (req, res, next) => {
  const { value, err } = loginUserSchema(req.body);

  if (err)
    throw new HttpError(
      401,
      'Invalid login data. Please ensure email and password are correct.',
      err,
    );

  req.body = value;
  next();
};

export const protect = catchAsync(async (req, res, next) => {
  const token =
    req.headers.authorization?.startsWith('Bearer ') &&
    req.headers.authorization.split(' ')[1];

  const userId = checkToken(token, process.env.ACCESS_SECRET_KEY);

  if (!userId)
    throw new HttpError(
      401,
      'Unauthorized access. Please provide a valid token.',
    );

  const currentUser = await getUserByIdService(userId);

  if (!currentUser)
    throw new HttpError(401, 'Unauthorized access. User not found.');

  req.user = currentUser;
  req.userId = userId;
  next();
});

export const checkUpdateUserData = (req, res, next) => {
  const { value, err } = updateUserValidator(req.body);

  if (err)
    throw new HttpError(
      400,
      'Invalid user data. Please ensure all required fields are correctly filled.',
      err,
    );

  next();
};

export const checkRefreshData = (req, res, next) => {
  const { value, err } = refreshUserValidator(req.body);

  if (err)
    throw new HttpError(
      403,
      'Invalid or expired refresh token. Please log in again.',
      err,
    );

  next();
};

export const refreshUserData = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  const userId = checkToken(refreshToken, process.env.REFRESH_SECRET_KEY);

  if (!userId) throw new HttpError(403, 'Invalid or expired refresh token.');

  const currentUser = await getUserByIdService(userId);

  if (!currentUser)
    throw new HttpError(403, 'User not found. Unable to refresh tokens.');

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

  const newSessionId = generateSessionId();

  await SessionsCollection.updateOne(
    { userId: currentUser._id },
    {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
      refreshTokenValidUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
      sessionId: newSessionId,
    },
    { upsert: true },
  );

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
    message: 'Tokens refreshed successfully.',
  });
});
