import db from './src/config/database.js';
import userService from './src/services/userService.js';

async function testDuplicateUser() {
    try {
        await db.authenticate();
        console.log('DB connected');

        // Attempt to create a user that already exists (e.g., 'superadmin' from seed)
        const payload = {
            username: 'superadmin',
            password: 'newpassword123',
            nama: 'Test Duplicate',
            role: 'pelayanan'
        };

        console.log('Attempting to create duplicate user...');
        await userService.createUser(payload);
        console.log('Error: Did not throw an exception on duplicate username!');
        process.exit(1);
    } catch (err) {
        if (err.statusCode === 409 && err.message === 'Username sudah digunakan.') {
            console.log('Success: Correctly threw 409 error with clear message ->', err.message);
            process.exit(0);
        } else {
            console.error('Error: Unexpected error or status code:', err);
            process.exit(1);
        }
    }
}

testDuplicateUser();
