import mongoose from 'mongoose';

const ExerciseSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  guestId: {
    type: String,
    required: false,
  },
  exerciseType: {
    type: String,
    enum: [
      'breathing', 'meditation', 'grounding', 'body_scan',
      'gratitude', 'affirmation', 'visualization', 'mindfulness',
      'progressive_relaxation', 'loving_kindness', 'breathing_4_7_8',
      'box_breathing', 'color_therapy', 'sound_therapy'
    ],
    required: true,
  },
  duration: {
    type: Number, // in seconds
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  effectiveness: {
    type: Number,
    min: 1,
    max: 5,
  },
  moodBefore: {
    type: Number,
    min: 1,
    max: 5,
  },
  moodAfter: {
    type: Number,
    min: 1,
    max: 5,
  },
  notes: {
    type: String,
    maxlength: 500,
  },
  interruptions: {
    type: Number,
    default: 0,
  },
  sessionData: {
    breathsPerMinute: Number,
    heartRate: Number,
    focusLevel: {
      type: Number,
      min: 1,
      max: 5,
    },
    distractionCount: Number,
  },
  environment: {
    location: String, // 'home', 'office', 'outdoor', 'commute'
    noiseLevel: {
      type: String,
      enum: ['quiet', 'moderate', 'noisy'],
    },
    lighting: {
      type: String,
      enum: ['natural', 'artificial', 'dim', 'bright'],
    },
  },
  reminders: {
    enabled: {
      type: Boolean,
      default: false,
    },
    frequency: String, // 'daily', 'weekly', 'custom'
    time: String, // HH:MM format
  },
}, {
  timestamps: true,
});

// Indexes
ExerciseSessionSchema.index({ userId: 1, createdAt: -1 });
ExerciseSessionSchema.index({ guestId: 1, createdAt: -1 });
ExerciseSessionSchema.index({ exerciseType: 1, createdAt: -1 });
ExerciseSessionSchema.index({ completed: 1 });
ExerciseSessionSchema.index({ effectiveness: 1 });

export default mongoose.models.ExerciseSession || mongoose.model('ExerciseSession', ExerciseSessionSchema);
