const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

app.use(express.json());
const allowedOrigins = (process.env.FRONTEND_URL || '').split(',').filter(Boolean);
app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
}));

// Serve static files from uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// --- DIAGNOSTIC LOGGING START --- //
const mongoUriForDiag = process.env.MONGO_URI;
if (mongoUriForDiag) {
    const maskedUri = mongoUriForDiag.replace(/:([^:]+)@/, ':*****@');
    console.log(`DIAGNOSTIC: Attempting to connect to: ${maskedUri}`);
} else {
    console.error('DIAGNOSTIC: MONGO_URI environment variable NOT SET!');
}
// --- DIAGNOSTIC LOGGING END --- //

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    console.log('MongoDB connected successfully!');
    // Admin user creation logic follows...
    try {
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'password', salt);
            await User.create({
                name: process.env.ADMIN_NAME || 'Admin',
                email: process.env.ADMIN_EMAIL || 'admin@example.com',
                password: hashedPassword,
                role: 'admin',
            });
            console.log('Admin user created successfully.');
        }
    } catch (error) {
        console.error('Error during admin user bootstrap:', error);
    }
})
.catch(err => {
    console.error('FATAL: MongoDB connection failed. Full error object:', err);
});

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/attendance-types', require('./routes/attendanceTypeRoutes'));
app.use('/api/movement', require('./routes/movementRoutes'));
app.use('/api', require('./routes/healthRoutes'));

const PORT = process.env.PORT || 5000;

module.exports = app;
