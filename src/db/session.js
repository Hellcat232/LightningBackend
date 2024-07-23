import { Schema, model } from 'mongoose';

const sessionSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    accessTokenValidUntil: {
      type: Date,
      requred: true,
    },
    refreshTokenValidUntil: {
      type: Date,
      requred: true,
    },
  },
  {
    versionKey: false,
  },
);

export const SessionsCollection = model('session', sessionSchema);
