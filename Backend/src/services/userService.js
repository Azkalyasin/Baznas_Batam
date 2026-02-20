import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const register = async (userData) => {
  const { username, password, nama, role } = userData;

  // Check if username exists
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    throw new Error('Username already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const newUser = await User.create({
    username,
    password: hashedPassword,
    nama,
    role
  });

  return {
    id: newUser.id,
    username: newUser.username,
    nama: newUser.nama,
    role: newUser.role
  };
};

const login = async (loginData) => {
  const { username, password } = loginData;

  // Find user
  const user = await User.findOne({ where: { username } });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Generate Token
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'secret', 
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      nama: user.nama,
      role: user.role
    }
  };
};

export default {
  register,
  login
};
