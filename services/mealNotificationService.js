const axios = require('axios');
const Attendance = require('../models/Attendance');

const DEFAULT_TZ = 'Asia/Kolkata';
const DEFAULT_OFFSET = '+05:30';

const getIsoDateInTimezone = (date = new Date(), timeZone = DEFAULT_TZ) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

const addDaysToIsoDate = (isoDate, days) => {
  const base = new Date(`${isoDate}T00:00:00.000Z`);
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
};

const getDateRangeForBusinessDay = (isoDate) => {
  const start = new Date(`${isoDate}T00:00:00.000${DEFAULT_OFFSET}`);
  const end = new Date(`${isoDate}T23:59:59.999${DEFAULT_OFFSET}`);
  return { start, end };
};

const sanitizeRecipient = (value) => (value || '').replace(/[^\d]/g, '');

const getRecipients = () => {
  const configured = [
    process.env.ADMIN_WHATSAPP_NUMBER,
    process.env.COOK_WHATSAPP_NUMBER,
    ...(process.env.WHATSAPP_RECIPIENTS || '').split(','),
  ];

  return [...new Set(configured.map(sanitizeRecipient).filter(Boolean))];
};

const sortStudentsByName = (students) =>
  students.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));

const formatNamesLine = (students) =>
  students.length ? students.map((student) => student.name).join(', ') : 'None';

const buildMealSummary = async ({ targetDate }) => {
  const { start, end } = getDateRangeForBusinessDay(targetDate);

  const attendanceRecords = await Attendance.find({
    date: { $gte: start, $lte: end },
  }).populate('user', 'name');

  const summary = {
    targetDate,
    breakfast: [],
    lunch: [],
    dinner: [],
  };

  const uniqueStudents = new Map();

  attendanceRecords.forEach((record) => {
    if (!record.user || !record.user.name) return;

    const student = {
      id: String(record.user._id),
      name: record.user.name.trim(),
    };

    if (record.breakfast) summary.breakfast.push(student);
    if (record.lunch) summary.lunch.push(student);
    if (record.dinner) summary.dinner.push(student);
    if (record.breakfast || record.lunch || record.dinner) {
      uniqueStudents.set(student.id, student.name);
    }
  });

  summary.breakfast = sortStudentsByName(summary.breakfast);
  summary.lunch = sortStudentsByName(summary.lunch);
  summary.dinner = sortStudentsByName(summary.dinner);
  summary.totalUniqueStudents = uniqueStudents.size;

  return summary;
};

const createWhatsappMessage = ({ summary, generatedForDate }) => {
  const dateLabel = new Intl.DateTimeFormat('en-IN', {
    timeZone: DEFAULT_TZ,
    dateStyle: 'full',
  }).format(new Date(`${generatedForDate}T00:00:00.000Z`));

  return [
    `Meal summary for ${dateLabel}`,
    `Total students opting at least one meal: ${summary.totalUniqueStudents}`,
    '',
    `Breakfast (${summary.breakfast.length})`,
    formatNamesLine(summary.breakfast),
    '',
    `Lunch (${summary.lunch.length})`,
    formatNamesLine(summary.lunch),
    '',
    `Dinner (${summary.dinner.length})`,
    formatNamesLine(summary.dinner),
  ].join('\n');
};

const sendWhatsappTextMessage = async ({ to, body }) => {
  if (!process.env.WHATSAPP_PHONE_NUMBER_ID || !process.env.WHATSAPP_ACCESS_TOKEN) {
    throw new Error('WhatsApp credentials are not configured');
  }

  await axios.post(
    `https://graph.facebook.com/v23.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 20000,
    }
  );
};

const prepareNextDayMealSummary = async () => {
  const businessDate = getIsoDateInTimezone(new Date(), process.env.APP_TIMEZONE || DEFAULT_TZ);
  const targetDate = addDaysToIsoDate(businessDate, 1);
  const summary = await buildMealSummary({ targetDate });
  const recipients = getRecipients();

  return {
    targetDate,
    recipients,
    summary,
    message: createWhatsappMessage({ summary, generatedForDate: targetDate }),
  };
};

module.exports = {
  buildMealSummary,
  createWhatsappMessage,
  getRecipients,
  getIsoDateInTimezone,
  prepareNextDayMealSummary,
  sendWhatsappTextMessage,
};
