import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

const getAllUsers = async (query) => {
  const { role, page = 1, limit = 10, search } = query;
  const offset = (page - 1) * limit;

  const where = {};
  if (role) where.role = role;
  if (search) {
    where.username = { [Op.like]: `%${search}%` };
  }

  const { rows, count } = await User.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    attributes: { exclude: ['password'] } // Don't return passwords
  });

  return { users: rows, total: count, page, totalPages: Math.ceil(count / limit) };
};

const getUserById = async (id) => {
  const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
  if (!user) throw new Error('User not found');
  return user;
};

const createUser = async (userData) => {
  const { username, password, nama, role } = userData;

  const existing = await User.findOne({ where: { username } });
  if (existing) throw new Error('Username already exists');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    username,
    password: hashedPassword,
    nama,
    role
  });

  return { id: newUser.id, username, nama, role };
};

const updateUser = async (id, updateData) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error('User not found');

  if (updateData.password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(updateData.password, salt);
  }

  await user.update(updateData);
  return { id: user.id, username: user.username, nama: user.nama, role: user.role };
};

const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error('User not found');
  await user.destroy();
  return { message: 'User deleted' };
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
