import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  firstName: {
    type: String,
    default: '',
  },
  lastName: {
    type: String,
    default: '',
  },
  fullName: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    required: false,
  },
  preferences: {
    communicationStyle: {
      type: String,
      enum: ['supportive', 'direct', 'gentle'],
      default: 'supportive',
    },
    privacyMode: {
      type: Boolean,
      default: false,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light',
    },
  },
  onboarding: {
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    initialMood: Number,
    goals: [String],
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
    },
    startDate: Date,
    endDate: Date,
  },
  emergencyContacts: [{
    name: String,
    phone: String,
    relationship: String,
  }],
  lastActive: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
UserSchema.index({ email: 1 });
UserSchema.index({ lastActive: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
