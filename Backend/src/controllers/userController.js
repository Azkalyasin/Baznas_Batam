import userService from '../services/userService.js';

const register = async (req, res) => {
  try {
    const user = await userService.register(req.body);
    res.status(201).json({
      success: true,
      data: user,
      message: 'User registered successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const data = await userService.login(req.body);
    res.status(200).json({
      success: true,
      data: data,
      message: 'Login successful'
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  register,
  login
};
