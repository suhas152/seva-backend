const MovementLog = require('../models/MovementLog');

// @desc    Checkout from hostel
// @route   POST /api/movement/checkout
// @access  Private (Student)
const checkout = async (req, res) => {
    const { reason } = req.body;

    if (!reason) {
        return res.status(400).json({ message: 'Reason is required' });
    }

    try {
        // Check if student is already out
        const activeLog = await MovementLog.findOne({ user: req.user._id, status: 'out' });
        if (activeLog) {
            return res.status(400).json({ message: 'You are already checked out.' });
        }

        const log = await MovementLog.create({
            user: req.user._id,
            checkoutTime: new Date(),
            reason,
            status: 'out'
        });

        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Checkin to hostel
// @route   PUT /api/movement/checkin
// @access  Private (Student)
const checkin = async (req, res) => {
    try {
        const log = await MovementLog.findOne({ user: req.user._id, status: 'out' });

        if (!log) {
            return res.status(400).json({ message: 'No active checkout found.' });
        }

        log.checkinTime = new Date();
        log.status = 'in';
        await log.save();

        res.json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get movement logs
// @route   GET /api/movement
// @access  Private
const getLogs = async (req, res) => {
    try {
        let logs;
        if (req.user.role === 'student') {
            logs = await MovementLog.find({ user: req.user._id }).sort({ createdAt: -1 });
        } else {
            // Ward or Admin see all logs
            logs = await MovementLog.find({})
                .populate('user', 'name email contactNumber profileImage role')
                .sort({ createdAt: -1 });
        }
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { checkout, checkin, getLogs };
