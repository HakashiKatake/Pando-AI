import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: false,
  },
  guestId: {
    type: String,
    required: false,
  },
  conversationId: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  messageType: {
    type: String,
    enum: ['text', 'guided', 'exercise', 'crisis_support'],
    default: 'text',
  },
  privacy: {
    type: Boolean,
    default: false,
  },
  guidedFlow: {
    step: String,
    options: [String],
    completed: Boolean,
  },
  sentiment: {
    score: Number, // -1 to 1
    magnitude: Number, // 0 to 1
    emotion: String,
  },
  triggerDetection: {
    level: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
    keywords: [String],
    requiresIntervention: {
      type: Boolean,
      default: false,
    },
  },
  aiModel: {
    type: String,
    default: 'openai/gpt-3.5-turbo',
  },
  responseTime: Number, // milliseconds
  isArchived: {
    type: Boolean,
    default: false,
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    sessionId: String,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
ChatMessageSchema.index({ userId: 1, createdAt: -1 });
ChatMessageSchema.index({ guestId: 1, createdAt: -1 });
ChatMessageSchema.index({ conversationId: 1, createdAt: 1 });
ChatMessageSchema.index({ 'triggerDetection.level': 1, createdAt: -1 });
ChatMessageSchema.index({ role: 1, createdAt: -1 });

export default mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);
