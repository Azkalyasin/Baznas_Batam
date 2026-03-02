import { Op } from 'sequelize';
import Distribusi from './src/models/distribusiModel.js';
import bootstrap from './bootstrap.js'; // Assuming this sets up associations

async function testFilter() {
    try {
        const pendingCount = await Distribusi.count({
            where: {
                status: {
                    [Op.or]: [
                        { [Op.eq]: 'menunggu' },
                        { [Op.eq]: null }
                    ]
                }
            }
        });
        console.log('Count for status=pending (menunggu or NULL):', pendingCount);

        const diterimaCount = await Distribusi.count({
            where: { status: 'diterima' }
        });
        console.log('Count for status=diterima:', diterimaCount);

        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testFilter();
