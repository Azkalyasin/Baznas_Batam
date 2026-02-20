import User from '../models/userModel.js';
import bcrypt from 'bcrypt';

const seedUser = async () => {
    try {
        const username = 'baznasbatam01';
        const password = 'baznas01';
        const role = 'superadmin';
        const nama = 'Super Admin Baznas';

        const existingUser = await User.findOne({ where: { username } });
        if (!existingUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await User.create({
                username,
                password: hashedPassword,
                nama,
                role
            });
            console.log(`[SEED] Superadmin created: ${username}`);
        } else {
            console.log(`[SEED] Superadmin already exists: ${username}`);
        }
    } catch (error) {
        console.error('[SEED] Error seeding superadmin:', error);
    }
};

export default seedUser;
