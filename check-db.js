const mongoose = require('mongoose');
const User = require('./models/User');
const Menu = require('./models/Menu');
const Attendance = require('./models/Attendance');
const dotenv = require('dotenv');

dotenv.config();

const checkDb = async () => {
    try {
        console.log('Connecting to DB at:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const userCount = await User.countDocuments();
        console.log(`\nUsers count: ${userCount}`);
        const users = await User.find({});
        users.forEach(u => console.log(` - ${u.name} (${u.role})`));

        const menuCount = await Menu.countDocuments();
        console.log(`\nMenus count: ${menuCount}`);
        const menus = await Menu.find({});
        menus.forEach(m => console.log(` - Date: ${m.date.toISOString().split('T')[0]}`));

        const attendanceCount = await Attendance.countDocuments();
        console.log(`\nAttendance records count: ${attendanceCount}`);

        console.log('\n✅ Database access confirmed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
};

checkDb();
