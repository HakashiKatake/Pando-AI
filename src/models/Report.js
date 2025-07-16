import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  classroomId: {
    type: String,
    required: true,
  },
  organizationId: {
    type: String,
    required: true,
  },
  reportType: {
    type: String,
    required: true,
    enum: ['bullying', 'harassment', 'discrimination', 'safety_concern', 'mental_health', 'academic_pressure', 'other'],
  },
  title: {
    type: String,
    required: true,
    maxLength: 100,
  },
  description: {
    type: String,
    required: true,
    maxLength: 1000,
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'dismissed'],
    default: 'pending',
  },
  isAnonymous: {
    type: Boolean,
    default: true,
  },
  // We don't store the actual student ID for anonymity
  studentHash: {
    type: String,
    required: true, // A hash to prevent duplicate reports from same student
  },
  location: {
    type: String,
    maxLength: 100,
  },
  incidentDate: {
    type: Date,
  },
  witnessCount: {
    type: Number,
    min: 0,
    max: 100,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  adminNotes: {
    type: String,
    maxLength: 500,
  },
  resolvedAt: {
    type: Date,
  },
  resolvedBy: {
    type: String, // Organization admin who resolved it
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
ReportSchema.index({ classroomId: 1, createdAt: -1 });
ReportSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
ReportSchema.index({ severity: 1, status: 1 });

// Pre-save middleware to update timestamp
ReportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);
