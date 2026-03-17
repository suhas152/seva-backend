const mongoose = require('mongoose');

const mealNotificationLogSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      required: true,
      default: 'next-day-meals',
    },
    targetDate: {
      type: String,
      required: true,
    },
    recipients: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['sent', 'failed'],
      default: 'sent',
    },
    messagePreview: {
      type: String,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

mealNotificationLogSchema.index({ kind: 1, targetDate: 1 }, { unique: true });

module.exports = mongoose.model('MealNotificationLog', mealNotificationLogSchema);
