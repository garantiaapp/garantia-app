const Warranty = require('../models/Warranty');
const Client = require('../models/Client');
const Product = require('../models/Product');
const emailService = require('../../email_system/emailService');

// @desc    Criar uma nova garantia
// @route   POST /api/warranties
// @access  Private
exports.createWarranty = async (req, res) => {
  try {
    const { clientId, productId, saleDate, price, invoiceNumber, notes } = req.body;

    // Verificar se o cliente existe
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado'
      });
    }

    // Verificar se o produto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    // Criar garantia
    const warranty = await Warranty.create({
      client: clientId,
      product: productId,
      saleDate,
      price,
      invoiceNumber,
      notes,
      createdBy: req.user._id
    });

    // Calcular a data de término da garantia (2 anos a partir da data da venda)
    const warrantyEndDate = new Date(warranty.warrantyEndDate);

    // Enviar e-mail de confirmação de garantia
    try {
      const emailResult = await emailService.sendWarrantyConfirmation(
        client.email,
        client.name,
        {
          name: product.name,
          code: product.code,
          price: price
        },
        saleDate,
        warrantyEndDate,
        product.image
      );

      if (emailResult.success) {
        warranty.emailSent = true;
        warranty.emailSentDate = Date.now();
        await warranty.save();
      }
    } catch (emailError) {
      console.error('Erro ao enviar e-mail de confirmação:', emailError);
      // Não interromper o fluxo se o e-mail falhar
    }

    res.status(201).json({
      success: true,
      data: warranty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Obter todas as garantias
// @route   GET /api/warranties
// @access  Private
exports.getWarranties = async (req, res) => {
  try {
    const warranties = await Warranty.find({})
      .populate('client', 'name email whatsapp')
      .populate('product', 'name code type price image')
      .populate('createdBy', 'name');
    
    res.status(200).json({
      success: true,
      count: warranties.length,
      data: warranties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Obter uma garantia específica
// @route   GET /api/warranties/:id
// @access  Private
exports.getWarranty = async (req, res) => {
  try {
    const warranty = await Warranty.findById(req.params.id)
      .populate('client', 'name email whatsapp')
      .populate('product', 'name code type price image')
      .populate('createdBy', 'name');

    if (!warranty) {
      return res.status(404).json({
        success: false,
        error: 'Garantia não encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: warranty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Atualizar uma garantia
// @route   PUT /api/warranties/:id
// @access  Private
exports.updateWarranty = async (req, res) => {
  try {
    let warranty = await Warranty.findById(req.params.id);

    if (!warranty) {
      return res.status(404).json({
        success: false,
        error: 'Garantia não encontrada'
      });
    }

    warranty = await Warranty.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('client', 'name email whatsapp')
      .populate('product', 'name code type price image')
      .populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      data: warranty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Excluir uma garantia
// @route   DELETE /api/warranties/:id
// @access  Private
exports.deleteWarranty = async (req, res) => {
  try {
    const warranty = await Warranty.findById(req.params.id);

    if (!warranty) {
      return res.status(404).json({
        success: false,
        error: 'Garantia não encontrada'
      });
    }

    await warranty.remove();

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

// @desc    Reenviar e-mail de confirmação de garantia
// @route   POST /api/warranties/:id/resend-email
// @access  Private
exports.resendWarrantyEmail = async (req, res) => {
  try {
    const warranty = await Warranty.findById(req.params.id)
      .populate('client')
      .populate('product');

    if (!warranty) {
      return res.status(404).json({
        success: false,
        error: 'Garantia não encontrada'
      });
    }

    // Calcular a data de término da garantia
    const warrantyEndDate = new Date(warranty.warrantyEndDate);

    // Enviar e-mail de confirmação de garantia
    const emailResult = await emailService.sendWarrantyConfirmation(
      warranty.client.email,
      warranty.client.name,
      {
        name: warranty.product.name,
        code: warranty.product.code,
        price: warranty.price
      },
      warranty.saleDate,
      warrantyEndDate,
      warranty.product.image
    );

    if (emailResult.success) {
      warranty.emailSent = true;
      warranty.emailSentDate = Date.now();
      await warranty.save();

      res.status(200).json({
        success: true,
        data: warranty,
        message: 'E-mail de confirmação reenviado com sucesso'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erro ao reenviar e-mail de confirmação'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
