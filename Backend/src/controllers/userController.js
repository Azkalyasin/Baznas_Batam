import userService from '../services/userService.js';

const getAll = async (req, res) => {
  try {
    const data = await userService.getAllUsers(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const data = await userService.getUserById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const data = await userService.createUser(req.body);
    res.status(201).json({ success: true, data, message: 'User created' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const data = await userService.updateUser(req.params.id, req.body);
    res.status(200).json({ success: true, data, message: 'User updated' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const destroy = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  destroy
};
