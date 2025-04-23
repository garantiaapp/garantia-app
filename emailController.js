const emailService = require('../../email_system/emailService');

// @desc    Verificar conexão com o servidor de e-mail
// @route   GET /api/email/verify
// @access  Private/Admin
exports.verifyEmailConnection = async (req, res) => {
  try {
    const result = await emailService.verifyConnection();
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Conexão com o servidor de e-mail estabelecida com sucesso'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Erro ao conectar ao servidor de e-mail'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Enviar e-mail de teste
// @route   POST /api/email/test
// @access  Private/Admin
exports.sendTestEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Por favor, forneça um endereço de e-mail'
      });
    }
    
    // Dados de teste para o e-mail
    const testData = {
      clientName: 'Cliente Teste',
      product: {
        name: 'Produto Teste',
        code: 'TEST-001',
        price: 299.99
      },
      saleDate: new Date(),
      warrantyEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
      productImage: process.env.LOGO_PATH // Usar logo como imagem de teste
    };
    
    const result = await emailService.sendWarrantyConfirmation(
      email,
      testData.clientName,
      testData.product,
      testData.saleDate,
      testData.warrantyEndDate,
      testData.productImage
    );
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: `E-mail de teste enviado com sucesso para ${email}`,
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Erro ao enviar e-mail de teste'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
