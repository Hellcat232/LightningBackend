import { model, Schema } from 'mongoose';
import { localDate, localTime } from '../services/water.js';
const waterSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    localMonth: { type: String },
    localDate: { type: String, default: () => localDate() },
    localTime: { type: String, default: () => localTime() },
    waterValue: { type: Number, required: [true, 'waterValue is required'] },
    totalWaterDrunk: { type: Number },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Water = model('Water', waterSchema);
