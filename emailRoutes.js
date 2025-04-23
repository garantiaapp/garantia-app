const express = require('express');
const router = express.Router();
const { 
  verifyEmailConnection,
  sendTestEmail
} = require('../controllers/emailController');
const { protect, authorize } = require('../middleware/auth');

// Todas as rotas de e-mail são protegidas e restritas a administradores
router.route('/verify')
  .get(protect, authorize('admin'), verifyEmailConnection);

router.route('/test')
  .post(protect, authorize('admin'), sendTestEmail);

module.exports = router;
