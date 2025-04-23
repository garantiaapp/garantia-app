const dotenv = require('dotenv');
dotenv.config();

// Configuração do servidor de e-mail
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true' || false,
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
  from: process.env.EMAIL_FROM || '"Etherna Joias" <noreply@ethernajoias.com>',
};

module.exports = emailConfig;
