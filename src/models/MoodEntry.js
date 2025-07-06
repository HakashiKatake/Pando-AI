import mongoose from 'mongoose';

const MoodEntrySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: false,
  },
  guestId: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  mood: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  emoji: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    maxlength: 500,
  },
  tags: [{
    type: String,
    maxlength: 50,
  }],
  activities: [{
    type: String,
    enum: [
      'exercise', 'meditation', 'socializing', 'work', 'sleep',
      'eating', 'therapy', 'journaling', 'reading', 'music',
      'nature', 'family_time', 'self_care', 'creative', 'learning'
    ],
  }],
  triggers: [{
    type: String,
    maxlength: 100,
  }],
  energy: {
    type: Number,
    min: 1,
    max: 5,
  },
  anxiety: {
    type: Number,
    min: 1,
    max: 5,
  },
  sleep: {
    hours: Number,
    quality: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  socialConnection: {
    type: Number,
    min: 1,
    max: 5,
  },
  productivity: {
    type: Number,
    min: 1,
    max: 5,
  },
  weather: {
    type: String,
    enum: ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy'],
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Compound index for efficient queries
MoodEntrySchema.index({ userId: 1, date: -1 });
MoodEntrySchema.index({ guestId: 1, date: -1 });
MoodEntrySchema.index({ date: -1 });
MoodEntrySchema.index({ mood: 1, date: -1 });

// Ensure only one mood entry per user per day
MoodEntrySchema.index(
  { userId: 1, date: 1 },
  { 
    unique: true,
    partialFilterExpression: { userId: { $exists: true } }
  }
);

MoodEntrySchema.index(
  { guestId: 1, date: 1 },
  { 
    unique: true,
    partialFilterExpression: { guestId: { $exists: true } }
  }
);

export default mongoose.models.MoodEntry || mongoose.model('MoodEntry', MoodEntrySchema);
