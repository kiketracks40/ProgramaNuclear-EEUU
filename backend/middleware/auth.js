const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware de autenticación
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nuclear-simulator-secret');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (!user.status.isActive || user.status.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive or banned.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Middleware de autorización por roles
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.permissions.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions.'
      });
    }

    next();
  };
};

// Middleware opcional de autenticación
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nuclear-simulator-secret');
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.status.isActive && !user.status.isBanned) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continúa sin autenticación si el token es inválido
    next();
  }
};

module.exports = {
  auth,
  authorize,
  optionalAuth
};