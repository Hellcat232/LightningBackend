
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
  const token = req.body.refreshToken;

  const userId = checkToken(token, process.env.REFRESH_SECRET_KEY);

  if (!userId) throw HttpError(403, 'Token invalid');

  const currentUser = await getUserByIdService(userId);

  if (!currentUser) throw HttpError(403, 'Token invalid');

  const accessToken = signToken(
    currentUser.id,
    process.env.ACCESS_SECRET_KEY,
    process.env.ACCESS_EXPIRES_IN,
  );

  const refreshToken = signToken(
    currentUser.id,
    process.env.REFRESH_SECRET_KEY,
    process.env.REFRESH_EXPIRES_IN,
  );

  currentUser.accessToken = accessToken;
  currentUser.refreshToken = refreshToken;
  await currentUser.save();

  req.currentUserRef = currentUser;
  req.accessToken = accessToken;
  req.refreshToken = refreshToken;

  next();
});
