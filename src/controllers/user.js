import {
  registerUser,
  loginUserService,
  logoutUserService,
  updateUserService,
} from '../services/user.js';
import { refreshUsersSession } from '../services/auth.js';
import { catchAsync } from '../utils/catchAsync.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { env } from '../utils/env.js';
import { HttpError } from '../utils/HttpError.js';
import { ONE_DAY } from '../constants/auth.js';

export const createUser = catchAsync(async (req, res) => {
  const { newUser } = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    user: { email: newUser.email },
    message: 'Successfully registered a user!',
    data: newUser,
  });
});

export const loginUser = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken, session } = await loginUserService(
    req.body,
  );

  res.status(200).json({
    user: {
      name: user.name,
      email: user.email,
      gender: user.gender,
      avatar: user.avatar,
      weight: user.weight,
      sportsActivity: user.sportsActivity,
      waterRate: user.waterRate,
    },
    accessToken,
    refreshToken,
    session,
  });

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });

  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken: session.accessToken,
    },
  });
});

export const logoutUser = catchAsync(async (req, res) => {
  if (req.cookies.sessionId) {
    await logoutUserService(req.cookies.sessionId);
  }

  // const id = req.userId;
  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.status(204).send();
});

export const currentUser = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });

  res.status(200).json({
    user: {
      name: res.user.name,
      email: res.user.email,
      gender: res.user.gender,
      avatar: res.user.avatar,
      weight: res.user.weight,
      sportsActivity: res.user.sportsActivity,
      waterRate: res.user.waterRate,
    },
  });
};

export const updateUser = async (req, res) => {
  const avatar = req.file;

  let avatarUrl;

  if (avatar) {
    if (env('ENABLE_CLOUDINARY') === 'true') {
      avatarUrl = await saveFileToCloudinary(avatar);
    } else {
      avatarUrl = await saveFileToUploadDir(avatar);
    }
  }
  const result = await updateUserService(req.user._id, {
    ...req.body,
    avatar: avatarUrl,
  });

  if (!result) {
    throw HttpError(404, 'User not found');
  }

  res.status(200).json({
    user: {
      name: result.user.name,
      email: result.user.email,
      gender: result.user.gender,
      avatar: result.user.avatar,
      weight: result.user.weight,
      sportsActivity: result.user.sportsActivity,
      waterRate: result.user.waterRate,
    },
  });
};

export const refreshUser = async (req, res) => {
  if (!req.cookies.sessionId || !req.cookies.refreshToken) {
    return res.status(400).json({
      status: 400,
      message: 'Session ID or Refresh Token not provided',
    });
  }
  const session = await refreshUsersSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  currentUser(res, session);

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
    user: {
      name: session.name,
      email: session.email,
      gender: session.gender,
      avatar: session.avatar,
      weight: session.weight,
      sportsActivity: session.sportsActivity,
      waterRate: session.waterRate,
    },
  });
};
