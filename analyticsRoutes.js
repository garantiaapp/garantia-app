const express = require('express');
const router = express.Router();
const { 
  getDashboardAnalytics,
  generateInsights
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

// Todas as rotas de análise são protegidas e restritas a administradores
router.route('/dashboard')
  .get(protect, authorize('admin'), getDashboardAnalytics);

router.route('/insights')
  .post(protect, authorize('admin'), generateInsights);

module.exports = router;
