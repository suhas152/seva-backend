const mongoose = require('mongoose');

const attendanceTypeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['general', 'morning_study', 'evening_prayer', 'night_study'],
    required: true,
  },
  photo: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'dismissed'],
    default: 'pending',
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  postedByRole: {
    type: String,
    enum: ['student', 'ward'],
    required: true,
  }
}, { timestamps: true });

attendanceTypeSchema.index({ user: 1, date: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceType', attendanceTypeSchema);
