const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAuth() {
    try {
        console.log('--- Testing Registration (Admin) ---');
        const adminEmail = `admin${Date.now()}@example.com`;
        const adminRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Admin User',
            email: adminEmail,
            password: 'password123',
            role: 'admin',
            contactNumber: '1234567890'
        });
        console.log('Admin Registered:', adminRes.data.email);
        const adminToken = adminRes.data.token;

        console.log('--- Testing Registration (Student) ---');
        const studentEmail = `student${Date.now()}@example.com`;
        const studentRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Student User',
            email: studentEmail,
            password: 'password123',
            role: 'student',
            contactNumber: '0987654321'
        });
        console.log('Student Registered:', studentRes.data.email);
        const studentToken = studentRes.data.token;

        console.log('--- Testing Menu Creation (Admin) ---');
        // Date: Tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];

        const menuRes = await axios.post(`${API_URL}/menu`, {
            date: dateStr,
            breakfast: 'Pancakes',
            lunch: 'Rice and Curry',
            dinner: 'Pasta'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('Menu Created for:', menuRes.data.date);

        console.log('--- Testing Mark Attendance (Student) ---');
        const attendanceRes = await axios.post(`${API_URL}/attendance`, {
            date: dateStr,
            breakfast: true,
            lunch: true,
            dinner: false
        }, {
            headers: { Authorization: `Bearer ${studentToken}` }
        });
        console.log('Attendance Marked:', attendanceRes.data);

        console.log('--- Testing Get Stats (Admin) ---');
        const statsRes = await axios.get(`${API_URL}/attendance/stats?date=${dateStr}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('Stats:', statsRes.data);

        console.log('--- SUCCESS: All tests passed ---');

    } catch (error) {
        console.error('--- ERROR ---');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Message:', error.message);
            console.error('Code:', error.code);
            console.error('Cause:', error.cause);
        }
    }
}

testAuth();
