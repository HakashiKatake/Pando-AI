import mongoose from 'mongoose';

const habitCompletionSchema = new mongoose.Schema({
  habitId: {
    type: String,
    required: true,
  },
  date: {
    type: String, // Store as YYYY-MM-DD string for easier querying
    required: true,
  },
  completed: {
    type: Boolean,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for efficient queries
habitCompletionSchema.index({ habitId: 1, date: 1, userId: 1 }, { unique: true });

export const HabitCompletion = mongoose.models.HabitCompletion || mongoose.model('HabitCompletion', habitCompletionSchema);
