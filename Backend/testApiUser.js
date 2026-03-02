import db from './src/config/database.js';
import User from './src/models/userModel.js';
import jwt from 'jsonwebtoken';

async function testWithToken() {
    try {
        await db.authenticate();
        // Get superadmin
        const user = await User.findOne({ where: { username: 'superadmin' } });
        if (!user) {
            console.error('Superadmin not found!');
            process.exit(1);
        }
        const token = jwt.sign(
            { id: user.id, role: 'superadmin' },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1d' }
        );
        console.log('Sending token to localhost:5501/api/users POST...');

        const res = await fetch('http://localhost:5501/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                username: 'superadmin',
                password: 'somepassword',
                nama: 'Duplicate User',
                role: 'pelayanan'
            })
        });

        const data = await res.json();
        console.log('HTTP Status:', res.status);
        console.log('Response JSON:', data);
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testWithToken();
