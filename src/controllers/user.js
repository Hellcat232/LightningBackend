import {
  registerUser,
  loginUserService,
  logoutUserService,
  updateUserService,
} from '../services/user.js';
import { catchAsync } from '../utils/catchAsync.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { env } from '../utils/env.js';
import { HttpError } from '../utils/HttpError.js';


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

export const updateUser = async ( req, res ) => {
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

  if(!result) {
    throw HttpError(404, "User not found");
  }

  res.status(200).json({
    message: "Successfully updated user!",
    data: result.user,
  });
};

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
