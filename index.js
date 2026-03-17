const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');
const fs = require('fs');

dotenv.config();

// Connect to MongoDB
const User = require('./models/User');
const bcrypt = require('bcryptjs');

let cachedConnection = null;

const connectDB = async () => {
    if (cachedConnection) {
        return cachedConnection;
    }
    
    try {
        cachedConnection = await mongoose.connect(process.env.MONGO_URI, {
            autoIndex: false,
            connectTimeoutMS: 20000,
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 20000,
        });
        console.log('MongoDB connected successfully');
        
        // Admin bootstrap logic
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
            console.log('Admin user created');
        }
        return cachedConnection;
    } catch (err) {
        cachedConnection = null;
        console.error('MongoDB connection error:', err);
        throw err;
    }
};

const app = express();

// Database connection middleware for serverless
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(503).json({ 
            message: 'Database connection failed', 
            error: err.message 
        });
    }
});

app.use(express.json());
const allowedOrigins = (process.env.FRONTEND_URL || '').split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow if no restrictions set (dev mode)
    if (allowedOrigins.length === 0) return callback(null, true);
    // Allow exact match
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any vercel.app subdomain (covers preview deployments)
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.get('/', (req, res) => {
    res.send('API is running...');
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/attendance-types', require('./routes/attendanceTypeRoutes'));
app.use('/api/movement', require('./routes/movementRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api', require('./routes/healthRoutes'));

const PORT = process.env.PORT || 5000;

module.exports = app;
