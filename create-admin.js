const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'admin@stas.com';
        const password = 'admin123';
        const name = 'Super Admin';
        const role = 'admin';

        let user = await User.findOne({ email });

        if (user) {
            console.log('Admin user already exists. Updating password...');
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            console.log('Password updated.');
        } else {
            console.log('Creating new admin user...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            user = await User.create({
                name,
                email,
                password: hashedPassword,
                role,
                contactNumber: '0000000000'
            });
            console.log('Admin user created.');
        }

        console.log('\n-----------------------------------');
        console.log('Admin Credentials:');
        console.log(`Email:    ${email}`);
        console.log(`Password: ${password}`);
        console.log('-----------------------------------\n');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createAdmin();
