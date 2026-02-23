import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const login = async ({ username, password }) => {
  const user = await User.findOne({ where: { username } });

  // Pesan generik: hindari bocornya info "username tidak ada" vs "password salah"
  if (!user) {
    throw Object.assign(new Error('Username atau password salah.'), { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw Object.assign(new Error('Username atau password salah.'), { status: 401 });
  }

  // Tidak ada fallback 'secret' — dijaga di app.js
  const token = jwt.sign(
    { id: user.id, role: user.role, nama: user.nama, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  return {
    token,
    user: {
      id: user.id,
      nama: user.nama,
      role: user.role
    }
  };
};

export default {
  login
};
