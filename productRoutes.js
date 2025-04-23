const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  createProduct, 
  getProducts, 
  getProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'backend/uploads/products/');
  },
  filename: function(req, file, cb) {
    cb(null, `product-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB
  },
  fileFilter: fileFilter
});

// Todas as rotas de produtos são protegidas
router.route('/')
  .post(protect, upload.single('image'), createProduct)
  .get(protect, getProducts);

router.route('/:id')
  .get(protect, getProduct)
  .put(protect, upload.single('image'), updateProduct)
  .delete(protect, deleteProduct);

module.exports = router;
