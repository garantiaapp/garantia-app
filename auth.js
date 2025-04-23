const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// Middleware para proteger rotas
exports.protect = async (req, res, next) => {
  let token;

  // Verificar se o token existe no header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Verificar se o token existe
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Não autorizado para acessar esta rota'
    });
  }

  try {
    // Verificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'etherna_secret_key');

    // Adicionar o usuário ao request
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Não autorizado para acessar esta rota'
    });
  }
};

// Middleware para verificar permissões de admin
exports.authorize = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        error: `Usuário com função ${req.user.role} não está autorizado a acessar esta rota`
      });
    }
    next();
  };
};
