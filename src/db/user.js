import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    name: {
      type: String,
      default: 'Anonymous',
    },
    email: {
      type: String,
      requred: true,
      unique: true,
    },
    password: {
      type: String,
      requred: true,
    },
    gender: {
      type: String,
      enum: ['woman', 'man'],
      default: 'woman',
    },
    weight: {
      type: String,
    },
    time_of_active: {
      type: String,
    },
    desired_quantity_of_water: {
      type: String,
    },
    photo: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const UserCollection = model('user', userSchema);
