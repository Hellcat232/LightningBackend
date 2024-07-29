import { catchAsync } from '../utils/catchAsync.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { env } from '../utils/env.js';
import { HttpError } from '../utils/HttpError.js';
import {
  registerUser,
  loginUserService,
  logoutUserService,
  updateUserService,
} from '../services/user.js';

export const createUser = catchAsync(async (req, res) => {
  const { newUser } = await registerUser(req.body);

  res.status(201).json({
    user: { email: newUser.email },
    message: 'User successfully registered.'
  });
});

export const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken, sessionId } = await loginUserService(
    { email, password },
  );

  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
    path: '/',
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
    path: '/',
  });

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
    message: 'Login successful.'
  });
});

export const logoutUser = catchAsync(async (req, res) => {
  const id = req.userId;

  await logoutUserService(id);

  res.clearCookie('sessionId', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
    path: '/',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
    path: '/',
  });

  res.sendStatus(204).json({
    message: 'User successfully logged out.'
  });
});

export const currentUser = (req, res) => {
  const currentUser = req.user;

  res.status(200).json({
    user: {
      name: currentUser.name,
      email: currentUser.email,
      gender: currentUser.gender,
      avatar: currentUser.avatar,
      weight: currentUser.weight,
      sportsActivity: currentUser.sportsActivity,
      waterRate: currentUser.waterRate,
    },
    message: 'Current user data retrieved successfully.'
  });
};

export const updateUser = catchAsync(async (req, res) => {
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
    throw new HttpError('404', 'User not found. Unable to update user data.');
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
    message: 'User data updated successfully.'
  });
});

export const refreshUser = (req, res) => {
  const { refreshToken, accessToken, currentUserRef } = req;

  res.status(200).json({
    accessToken,
    refreshToken,
    user: {
      name: currentUserRef.name,
      email: currentUserRef.email,
      gender: currentUserRef.gender,
      avatar: currentUserRef.avatar,
      weight: currentUserRef.weight,
      sportsActivity: currentUserRef.sportsActivity,
      waterRate: currentUserRef.waterRate,
    },
    message: 'Tokens refreshed successfully.'
  });
};
