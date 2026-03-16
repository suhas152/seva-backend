const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    breakfast: {
        type: Boolean,
        default: false,
    },
    lunch: {
        type: Boolean,
        default: false,
    },
    dinner: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

// Compound index to ensure a user can only have one attendance record per date
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
