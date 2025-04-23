const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  getUsers, 
  deleteUser 
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Rotas públicas
router.post('/register', registerUser);
router.post('/login', loginUser);

// Rotas protegidas para usuários
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Rotas protegidas para administradores
router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/:id')
  .delete(protect, authorize('admin'), deleteUser);

module.exports = router;
