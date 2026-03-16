const mongoose = require('mongoose');

const movementLogSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    checkoutTime: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    checkinTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['out', 'in'],
        default: 'out'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MovementLog', movementLogSchema);
