const express = require('express');
const router = express.Router();
const { 
  createWarranty, 
  getWarranties, 
  getWarranty, 
  updateWarranty, 
  deleteWarranty,
  resendWarrantyEmail
} = require('../controllers/warrantyController');
const { protect } = require('../middleware/auth');

// Todas as rotas de garantias são protegidas
router.route('/')
  .post(protect, createWarranty)
  .get(protect, getWarranties);

router.route('/:id')
  .get(protect, getWarranty)
  .put(protect, updateWarranty)
  .delete(protect, deleteWarranty);

router.route('/:id/resend-email')
  .post(protect, resendWarrantyEmail);

module.exports = router;
