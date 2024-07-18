import { Schema, model } from 'mongoose';

const createWaterSchema = new Schema(
  {
    value_water: {
      type: String,
      default: 250,
    },
    recording_time: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Water = model('water', createWaterSchema);
