import authService from '../services/authService.js';

const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    res.status(200).json({
      success: true,
      data: data,
      message: 'Login berhasil.'
    });
  } catch (error) {
    // Error auth (401) langsung respond; error lain (500) diteruskan ke global handler
    if (error.status === 401) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
    next(error); // Teruskan error server ke global error handler
  }
};

const logout = async (req, res) => {
  // Logout berbasis JWT dilakukan di sisi client dengan menghapus token.
  // Untuk keamanan lebih, implementasikan token blacklist di sini.
  res.status(200).json({
    success: true,
    message: 'Logout berhasil.'
  });
};

const me = async (req, res) => {
  // User sudah di-attach ke req oleh authMiddleware
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
