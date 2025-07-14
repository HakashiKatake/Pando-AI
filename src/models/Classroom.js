import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  email: String,
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const ClassroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  description: String,
  gradeLevel: String,
  maxStudents: Number,
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  organizationId: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  students: [StudentSchema],
  studentCount: {
    type: Number,
    default: 0,
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

ClassroomSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.studentCount = this.students.length;
  next();
});

export default mongoose.models.Classroom || mongoose.model('Classroom', ClassroomSchema);
