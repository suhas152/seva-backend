const axios = require('axios').default;

const API_URL = 'http://localhost:5000/api';

async function testWardCreation() {
    try {
        // 1. Login as Admin
        console.log('--- Logging in as Admin ---');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@stas.com',
            password: 'admin123'
        });
        const adminToken = loginRes.data.token;
        console.log('Admin logged in. Token received.');

        // 2. Create Ward
        console.log('--- Creating Ward ---');
        const wardEmail = `ward${Date.now()}@stas.com`;
        const wardPassword = 'wardpassword123';
        
        try {
            const createRes = await axios.post(`${API_URL}/auth/create-ward`, {
                name: 'Test Ward',
                email: wardEmail,
                password: wardPassword,
                contactNumber: '9988776655'
            }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            console.log('Ward created:', createRes.data);
        } catch (err) {
            console.error('Failed to create ward:', err.response ? err.response.data : err.message);
            return;
        }

        // 3. Login as new Ward
        console.log('--- Logging in as new Ward ---');
        const wardLoginRes = await axios.post(`${API_URL}/auth/login`, {
            email: wardEmail,
            password: wardPassword
        });
        console.log('Ward login successful!');
        console.log('Ward Role:', wardLoginRes.data.role);

        if (wardLoginRes.data.role === 'ward') {
            console.log('SUCCESS: Ward creation and login verified.');
        } else {
            console.error('FAILURE: Role mismatch.');
        }

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
}

testWardCreation();
