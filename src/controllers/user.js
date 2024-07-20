import {
  registerUser,
  loginUserService,
  logoutUserService,
  updateUserService,
} from '../services/user.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createUser = catchAsync(async (req, res) => {
  const { newUser } = await registerUser(req.body);

  res.status(201).json({
    user: { email: newUser.email },
  });
});

export const loginUser = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await loginUserService(req.body);

  res.status(200).json({
    user: {
      email: user.email,
      name: user.name,
      gender: user.gender,
      avatar: user.avatar,
      weight: user.weight,
      sportsActivity: user.sportsActivity,
      waterRate: user.waterRate,
    },
    accessToken,
    refreshToken,
  });
});

export const logoutUser = catchAsync(async (req, res) => {
  const id = req.userId;

  await logoutUserService(id);

  res.sendStatus(204);
});

export const currentUser = (req, res) => {
  const currentUser = req.user;

  res.status(200).json({
    email: currentUser.email,
    name: currentUser.name,
    gender: currentUser.gender,
    avatarURL: currentUser.avatar,
    weight: currentUser.weight,
    sportsActivity: currentUser.sportsActivity,
    waterRate: currentUser.waterRate,
  });
};

export const updateUser = catchAsync(async (req, res) => {
  const updatedUser = await updateUserService(
    req.body,
    req.user,
    req.file,
    req.userId,
  );
  res.status(200).json({
    avatarUrl: updatedUser.avatar,
    name: updatedUser.name,
    gender: updatedUser.gender,
    email: updatedUser.email,
    weight: updatedUser.weight,
    sportsActivity: updatedUser.sportsActivity,
    waterRate: updatedUser.waterRate,
  });
});

export const refreshUser = (req, res) => {
  const { refreshToken, accessToken, currentUserRef } = req;

  res.status(200).json({
    accessToken,
    refreshToken,
    user: {
      avatarUrl: currentUserRef.avatar,
      name: currentUserRef.name,
      gender: currentUserRef.gender,
      email: currentUserRef.email,
      weight: currentUserRef.weight,
      sportsActivity: currentUserRef.sportsActivity,
      waterRate: currentUserRef.waterRate,
    },
  });
};
