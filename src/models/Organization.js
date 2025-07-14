import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  organizationName: {
    type: String,
    required: true,
  },
  organizationType: {
    type: String,
    required: true,
    enum: ['school', 'university', 'clinic', 'nonprofit', 'other'],
  },
  address: {
    type: String,
    required: true,
  },
  phone: String,
  contactEmail: {
    type: String,
    required: true,
  },
  studentCount: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

OrganizationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);
