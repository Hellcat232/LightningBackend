import { model, Schema } from 'mongoose';
import { localDate, localTime } from '../services/water.js';

// Создание схемы для хранения записей о потреблении воды
const waterSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Обязательное поле, ссылка на пользователя
    },
    localMonth: { type: String }, // Поле для хранения месяца
    localDate: { type: String, default: () => localDate() }, // Поле для хранения даты с значением по умолчанию
    localTime: { type: String, default: () => localTime() }, // Поле для хранения времени с значением по умолчанию
    waterValue: { type: Number, required: [true, 'waterValue is required'] }, // Обязательное поле для хранения количества выпитой воды
    totalWaterDrunk: { type: Number }, // Поле для хранения общего количества выпитой воды
  },
  {
    timestamps: true, // Автоматическое добавление полей createdAt и updatedAt
    versionKey: false, // Отключение версии документа (__v)
  },
);

// Экспорт модели Water на основе схемы waterSchema
export const Water = model('Water', waterSchema);
