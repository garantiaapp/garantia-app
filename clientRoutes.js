const express = require('express');
const router = express.Router();
const { 
  createClient, 
  getClients, 
  getClient, 
  updateClient, 
  deleteClient 
} = require('../controllers/clientController');
const { protect } = require('../middleware/auth');

// Todas as rotas de clientes são protegidas
router.route('/')
  .post(protect, createClient)
  .get(protect, getClients);

router.route('/:id')
  .get(protect, getClient)
  .put(protect, updateClient)
  .delete(protect, deleteClient);

module.exports = router;
