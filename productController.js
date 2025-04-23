const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

// @desc    Criar um novo produto
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res) => {
  try {
    // Verificar se há uma imagem no upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Por favor, adicione uma imagem do produto'
      });
    }

    const { name, code, type, description, price, stock } = req.body;

    // Verificar se o produto já existe
    const productExists = await Product.findOne({ code });

    if (productExists) {
      // Remover a imagem enviada se o produto já existir
      fs.unlinkSync(req.file.path);
      
      return res.status(400).json({
        success: false,
        error: 'Produto com este código já existe'
      });
    }

    // Criar produto
    const product = await Product.create({
      name,
      code,
      type,
      description,
      price,
      stock: stock || 0,
      image: req.file.path
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    // Se houver erro e a imagem foi enviada, remover
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Obter todos os produtos
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Obter um produto específico
// @route   GET /api/products/:id
// @access  Private
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Atualizar um produto
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    // Se houver uma nova imagem, atualizar
    if (req.file) {
      // Remover a imagem antiga
      if (fs.existsSync(product.image)) {
        fs.unlinkSync(product.image);
      }
      
      req.body.image = req.file.path;
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    // Se houver erro e a imagem foi enviada, remover
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Excluir um produto
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    // Remover a imagem do produto
    if (fs.existsSync(product.image)) {
      fs.unlinkSync(product.image);
    }

    await product.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
