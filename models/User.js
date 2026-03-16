const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'cook', 'student', 'ward'],
        default: 'student',
    },
    contactNumber: {
        type: String,
    },
    name: {
        type: String,
    },
    fatherName: {
        type: String,
    },
    motherName: {
        type: String,
    },
    gothram: {
        type: String,
    },
    age: {
        type: Number,
    },
    address: {
        type: String,
    },
    profileImage: {
        type: String, // Path to the uploaded image
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
