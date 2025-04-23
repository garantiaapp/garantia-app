const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const emailConfig = require('../backend/config/emailConfig');
require('dotenv').config();

// Criar transporter com as configurações do servidor de e-mail
const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: emailConfig.auth
});

// Carregar template de e-mail
const loadTemplate = (templateName) => {
  const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
  const templateSource = fs.readFileSync(templatePath, 'utf8');
  return handlebars.compile(templateSource);
};

// Função para enviar e-mail de confirmação de garantia
const sendWarrantyConfirmation = async (clientEmail, clientName, product, saleDate, warrantyEndDate, productImage) => {
  try {
    // Carregar e compilar o template
    const template = loadTemplate('warranty_confirmation');
    
    // Formatar datas
    const formattedSaleDate = new Date(saleDate).toLocaleDateString('pt-BR');
    const formattedWarrantyEndDate = new Date(warrantyEndDate).toLocaleDateString('pt-BR');
    
    // Formatar preço
    const formattedPrice = Number(product.price).toFixed(2).replace('.', ',');
    
    // Compilar o HTML com os dados
    const htmlContent = template({
      clientName,
      productName: product.name,
      productCode: product.code,
      saleDate: formattedSaleDate,
      productPrice: formattedPrice,
      warrantyEndDate: formattedWarrantyEndDate
    });

    // Configurar opções do e-mail
    const mailOptions = {
      from: emailConfig.from,
      to: clientEmail,
      subject: 'Confirmação de Garantia - Etherna Joias',
      html: htmlContent,
      attachments: [
        {
          filename: 'logo.png',
          path: process.env.LOGO_PATH || path.join(__dirname, '..', 'backend', 'uploads', 'logo.png'),
          cid: 'logo'
        },
        {
          filename: 'product.jpg',
          path: productImage,
          cid: 'productImage'
        }
      ]
    };

    // Enviar e-mail
    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail enviado: %s', info.messageId);
    
    return { 
      success: true, 
      messageId: info.messageId 
    };
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Verificar conexão com o servidor de e-mail
const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('Servidor de e-mail conectado e pronto para enviar mensagens');
    return { success: true };
  } catch (error) {
    console.error('Erro ao conectar ao servidor de e-mail:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWarrantyConfirmation,
  verifyConnection
};
