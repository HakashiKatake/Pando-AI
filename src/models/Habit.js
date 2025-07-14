import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    required: true,
    enum: ['health', 'productivity', 'mindfulness', 'learning', 'social', 'creative', 'other'],
  },
  frequency: {
    type: String,
    required: true,
    enum: ['daily', 'weekdays', 'weekends', 'weekly', 'custom'],
    default: 'daily',
  },
  targetValue: {
    type: Number,
    default: 1,
  },
  unit: {
    type: String,
    default: '',
  },
  reminderTime: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  userId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Habit = mongoose.models.Habit || mongoose.model('Habit', habitSchema);
