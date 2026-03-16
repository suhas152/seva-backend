const Attendance = require('../models/Attendance');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private/Student
const markAttendance = async (req, res) => {
    const { date, breakfast, lunch, dinner } = req.body;
    const userId = req.user._id;

    try {
        const toBool = (v) => {
            if (typeof v === 'string') {
                const s = v.trim().toLowerCase();
                if (['true', '1', 'yes', 'y', 'on'].includes(s)) return true;
                if (['false', '0', 'no', 'n', 'off'].includes(s)) return false;
            }
            return Boolean(v);
        };
        /* 
        // --- Time Window Validation ---
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Convert to minutes for easier comparison
        const currentTotalMinutes = currentHour * 60 + currentMinute;

        // Window 1: 09:30 AM - 10:30 AM (Morning) -> 570 mins to 630 mins
        const morningStart = 9 * 60 + 30;
        const morningEnd = 10 * 60 + 30;

        // Window 2: 08:00 PM - 12:00 PM (Night) -> 1200 mins to 1439 mins
        const nightStart = 20 * 60;
        const nightEnd = 24 * 60; // Midnight

        const isMorningWindow = currentTotalMinutes >= morningStart && currentTotalMinutes <= morningEnd;
        const isNightWindow = currentTotalMinutes >= nightStart && currentTotalMinutes <= nightEnd;

        // NOTE: For testing purposes, you might want to comment this out if you are not in these windows
        if (!isMorningWindow && !isNightWindow) {
             return res.status(400).json({ 
                 message: 'Attendance allowed only at 09:30 AM - 10:30 AM and 08:00 PM - 12:00 PM' 
             });
        }
        // ------------------------------
        */

        const attendanceDate = date ? new Date(date) : new Date();
        if (Number.isNaN(attendanceDate.getTime())) {
             return res.status(400).json({ message: 'Invalid date' });
        }
        attendanceDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (attendanceDate < today) {
             return res.status(400).json({ message: 'Attendance cannot be marked for past dates.' });
        }

        const start = new Date(attendanceDate);
        const end = new Date(attendanceDate);
        end.setHours(23, 59, 59, 999);

        let attendance = await Attendance.findOne({ 
            user: userId, 
            date: { $gte: start, $lte: end } 
        });

        if (attendance) {
            // Update
            attendance.breakfast = breakfast !== undefined ? toBool(breakfast) : attendance.breakfast;
            attendance.lunch = lunch !== undefined ? toBool(lunch) : attendance.lunch;
            attendance.dinner = dinner !== undefined ? toBool(dinner) : attendance.dinner;
            await attendance.save();
            res.json(attendance);
        } else {
            // Create
            attendance = await Attendance.create({
                user: userId,
                date: attendanceDate,
                breakfast: breakfast !== undefined ? toBool(breakfast) : false,
                lunch: lunch !== undefined ? toBool(lunch) : false,
                dinner: dinner !== undefined ? toBool(dinner) : false
            });
            res.status(201).json(attendance);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance for user
// @route   GET /api/attendance/my
// @access  Private/Student
const getMyAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ user: req.user._id }).sort({ date: 1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get daily stats (counts and names)
// @route   GET /api/attendance/stats
// @access  Private/Admin/Cook
const getAttendanceStats = async (req, res) => {
    const { date } = req.query;

    try {
        let query = {};
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.date = { $gte: start, $lte: end };
        }

        // Find all attendance records for the date and populate user details
        const attendanceRecords = await Attendance.find(query).populate('user', 'name email contactNumber profileImage');

        // Structure the data for the table
        const stats = {
            date: date,
            breakfast: [],
            lunch: [],
            dinner: []
        };

        attendanceRecords.forEach(record => {
            if (record.user) {
                const studentInfo = {
                    name: (record.user && record.user['name']) || '',
                    email: (record.user && record.user['email']) || '',
                    contact: (record.user && record.user['contactNumber']) || '',
                    profileImage: (record.user && record.user['profileImage']) || null
                };

                if (record.breakfast) stats.breakfast.push(studentInfo);
                if (record.lunch) stats.lunch.push(studentInfo);
                if (record.dinner) stats.dinner.push(studentInfo);
            }
        });

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { markAttendance, getMyAttendance, getAttendanceStats };
