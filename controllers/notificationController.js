const MealNotificationLog = require('../models/MealNotificationLog');
const {
  prepareNextDayMealSummary,
  sendSummaryEmail,
} = require('../services/mealNotificationService');

const sendNextDayMealSummary = async (req, res) => {
  try {
    const force = req.query.force === 'true';
    const payload = await prepareNextDayMealSummary();

    if (!payload.recipients.length) {
      return res.status(400).json({
        message: 'No email recipients configured',
      });
    }

    const existingLog = await MealNotificationLog.findOne({
      kind: 'next-day-meals',
      targetDate: payload.targetDate,
    });

    if (existingLog && !force) {
      return res.json({
        message: 'Meal summary email already sent for this target date',
        targetDate: payload.targetDate,
        recipients: existingLog.recipients,
        skipped: true,
      });
    }

    for (const recipient of payload.recipients) {
      await sendSummaryEmail({
        to: recipient,
        subject: payload.subject,
        text: payload.message,
      });
    }

    await MealNotificationLog.findOneAndUpdate(
      {
        kind: 'next-day-meals',
        targetDate: payload.targetDate,
      },
      {
        kind: 'next-day-meals',
        targetDate: payload.targetDate,
        recipients: payload.recipients,
        status: 'sent',
        messagePreview: payload.message.slice(0, 500),
        sentAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json({
      message: 'Next-day meal summary email sent successfully',
      targetDate: payload.targetDate,
      recipients: payload.recipients,
      totalUniqueStudents: payload.summary.totalUniqueStudents,
      counts: {
        breakfast: payload.summary.breakfast.length,
        lunch: payload.summary.lunch.length,
        dinner: payload.summary.dinner.length,
      },
      skipped: false,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to send next-day meal summary email',
      error: error.message,
    });
  }
};

module.exports = { sendNextDayMealSummary };
