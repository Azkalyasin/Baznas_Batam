import User from '../models/userModel.js';
import bcrypt from 'bcrypt';

const seedUser = async () => {
  try {
    // Baca dari environment variable agar tidak hardcode di kode
    const username = process.env.SEED_ADMIN_USERNAME || 'baznasbatam01';
    const password = process.env.SEED_ADMIN_PASSWORD || 'baznas01';
    const role = 'superadmin';
    const nama = 'Super Admin Baznas';

    const existingUser = await User.findOne({ where: { username } });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 12);
      await User.create({ username, password: hashedPassword, nama, role });
      console.log(`[SEED] Superadmin berhasil dibuat: ${username}`);
    } else {
      console.log(`[SEED] Superadmin sudah ada: ${username}`);
    }
  } catch (error) {
    console.error('[SEED] Error saat seeding superadmin:', error.message);
  }
};

export default seedUser;
