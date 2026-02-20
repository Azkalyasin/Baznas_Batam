import authService from '../services/authService.js';

const login = async (req, res) => {
  try {
    const data = await authService.login(req.body);
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

const logout = async (req, res) => {
  // Client-side logout (remove token). Server can blacklist token if needed (advanced).
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

const me = async (req, res) => {
  // User attached to req by authMiddleware
  res.status(200).json({
    success: true,
    data: req.user
  });
};

export default {
  login,
  logout,
  me
};
