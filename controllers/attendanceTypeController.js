const AttendanceType = require('../models/AttendanceType');

const normalizeDate = (d) => {
  const nd = new Date(d);
  nd.setHours(0, 0, 0, 0);
  return nd;
};

// Student: mark general attendance (before 11:00 AM)
const markGeneral = async (req, res) => {
  const { date } = req.body;
  const now = new Date();
  if (now.getHours() >= 11) {
    return res.status(400).json({ message: 'General attendance allowed only before 11:00 AM' });
  }
  try {
    const attendanceDate = normalizeDate(date);
    let rec = await AttendanceType.findOne({ user: req.user._id, date: attendanceDate, type: 'general' });
    if (!rec) {
      rec = await AttendanceType.create({
        user: req.user._id,
        date: attendanceDate,
        type: 'general',
        status: 'pending',
        postedByRole: 'student',
      });
    }
    res.status(rec.wasNew ? 201 : 200).json(rec);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ward: post types with photo
const postWard = async (req, res) => {
  const { date, type } = req.body;
  const validTypes = ['morning_study', 'evening_prayer', 'night_study'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ message: 'Invalid attendance type for ward' });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'Photo is required' });
  }
  try {
    const attendanceDate = normalizeDate(date);
    const photoPath = `/${req.file.path.replace(/\\/g, '/')}`;
    let rec = await AttendanceType.findOne({ user: req.user._id, date: attendanceDate, type });
    if (rec) {
      rec.photo = photoPath;
      rec.status = 'pending';
      rec.postedByRole = 'ward';
      await rec.save();
      return res.json(rec);
    }
    rec = await AttendanceType.create({
      user: req.user._id,
      date: attendanceDate,
      type,
      photo: photoPath,
      status: 'pending',
      postedByRole: 'ward',
    });
    res.status(201).json(rec);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// My records
const getMy = async (req, res) => {
  try {
    const list = await AttendanceType.find({ user: req.user._id }).sort({ date: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: list all
const getAll = async (req, res) => {
  const { date } = req.query;
  try {
    const query = {};
    if (date) {
      const start = normalizeDate(date);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }
    const list = await AttendanceType.find(query).populate('user', 'name email contactNumber profileImage role').sort({ date: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: verify
const verify = async (req, res) => {
  try {
    const rec = await AttendanceType.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Record not found' });
    rec.status = 'verified';
    rec.verifiedBy = req.user._id;
    await rec.save();
    res.json(rec);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: dismiss
const dismiss = async (req, res) => {
  try {
    const rec = await AttendanceType.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Record not found' });
    rec.status = 'dismissed';
    rec.verifiedBy = undefined;
    await rec.save();
    res.json(rec);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { markGeneral, postWard, getMy, getAll, verify, dismiss };
