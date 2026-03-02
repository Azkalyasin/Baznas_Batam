import db from './src/config/database.js';
import mustahiqService from './src/services/mustahiqService.js';

async function testCreate() {
    try {
        await db.authenticate();
        console.log('DB connected');

        // mock payload
        const payload = {
            nrm: 'TEST-NRM-12345',
            nama: 'Testing Mustahiq',
            kecamatan_id: 1, // Make sure these exist
            kelurahan_id: 1,
            asnaf_id: 1,
            kategori_mustahiq_id: 1,
            registered_date: '2026-03-02'
        };

        const userId = 1; // Assuming user ID 1 exists (superadmin)

        console.log('Creating mustahiq...');
        const result = await mustahiqService.create(payload, userId);
        console.log('Success:', result.toJSON());
        process.exit(0);
    } catch (err) {
        console.error('Error creating Mustahiq:', err);
        process.exit(1);
    }
}

testCreate();
