import { User } from '../db/user.js';
import { HttpError } from '../utils/HttpError.js';
import { signToken } from './jwtServices.js';


export const checkUserExistsService = (filter) => {
  return User.exists(filter);
};


export const registerUser = async (userData) => {
  const email = userData.email;

  let name = email.split('@')[0];

  name = name.charAt(0).toUpperCase() + name.slice(1);

  userData.name = name;

  const newUser = await User.create(userData);

  return { newUser };
};


export const loginUserService = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) throw HttpError(401, 'Email or password is wrong');

  const passwordIsValid = await user.checkUserPassword(password, user.password);

  if (!passwordIsValid) throw HttpError(401, 'Email or password is wrong');

  const accessToken = signToken(
    user.id,
    process.env.ACCESS_SECRET_KEY,
    process.env.ACCESS_EXPIRES_IN,
  );

  const refreshToken = signToken(
    user.id,
    process.env.REFRESH_SECRET_KEY,
    process.env.REFRESH_EXPIRES_IN,
  );

  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
};


export const getUserByIdService = (id) => {
  return User.findById(id);
};


export const logoutUserService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw HttpError(401, 'Unauthorized');
  }

  user.accessToken = null;
  user.refreshToken = null;

  await user.save();
};


export const updateUserService = async (userData, user) => {

  Object.keys(userData).forEach((key) => {
    user[key] = userData[key];
  });

  return user.save();
};
