import { model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

import { userGender } from '../constants/userGender.js';

const userSchema = Schema(
  {
    googleId: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    password: {
      type: String,
    },
    accessToken: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    name: {
      type: String,
    },
    gender: {
      type: String,
      enum: Object.values(userGender),
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    weight: {
      type: String,
      default: null,
    },
    sportsActivity: {
      type: String,
      default: null,
    },
    waterRate: {
      type: String,
      default: '1.5',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

userSchema.methods.checkUserPassword = (candidate, passwordHash) =>
  bcrypt.compare(candidate, passwordHash);

export const User = model('User', userSchema);
