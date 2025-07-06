import mongoose from 'mongoose';

const FeedbackEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  guestId: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    enum: ['feedback', 'journal', 'reflection', 'gratitude', 'goal'],
    required: true,
  },
  title: {
    type: String,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  mood: {
    type: Number,
    min: 1,
    max: 5,
  },
  tags: [{
    type: String,
    maxlength: 50,
  }],
  category: {
    type: String,
    enum: [
      'general', 'anxiety', 'depression', 'stress', 'relationships',
      'work', 'family', 'health', 'goals', 'gratitude', 'progress',
      'challenges', 'wins', 'insights', 'questions'
    ],
  },
  isPrivate: {
    type: Boolean,
    default: true,
  },
  sentiment: {
    score: Number, // -1 to 1
    magnitude: Number, // 0 to 1
    emotion: String,
  },
  wordCount: {
    type: Number,
    default: 0,
  },
  readingTime: {
    type: Number, // estimated minutes
    default: 0,
  },
  attachments: [{
    type: String, // URLs or file paths
  }],
  linkedEntries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeedbackEntry',
  }],
  isArchived: {
    type: Boolean,
    default: false,
  },
  reminderDate: Date,
  goalProgress: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    milestones: [String],
    completedMilestones: [String],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  favorited: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Pre-save middleware to calculate word count and reading time
FeedbackEntrySchema.pre('save', function(next) {
  if (this.content) {
    this.wordCount = this.content.split(/\s+/).filter(word => word.length > 0).length;
    this.readingTime = Math.ceil(this.wordCount / 200); // Average reading speed
  }
  next();
});

// Indexes for efficient queries
FeedbackEntrySchema.index({ userId: 1, createdAt: -1 });
FeedbackEntrySchema.index({ guestId: 1, createdAt: -1 });
FeedbackEntrySchema.index({ type: 1, createdAt: -1 });
FeedbackEntrySchema.index({ category: 1, createdAt: -1 });
FeedbackEntrySchema.index({ tags: 1 });
FeedbackEntrySchema.index({ favorited: 1, createdAt: -1 });
FeedbackEntrySchema.index({ isArchived: 1 });

// Text search index
FeedbackEntrySchema.index({
  title: 'text',
  content: 'text',
  tags: 'text'
});

export default mongoose.models.FeedbackEntry || mongoose.model('FeedbackEntry', FeedbackEntrySchema);
