const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, informe o nome do cliente']
  },
  email: {
    type: String,
    required: [true, 'Por favor, informe o email do cliente'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor, informe um email válido'
    ]
  },
  whatsapp: {
    type: String,
    required: [true, 'Por favor, informe o número de WhatsApp do cliente'],
    match: [
      /^\d{10,15}$/,
      'Por favor, informe um número de WhatsApp válido (apenas números)'
    ]
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Atualizar a data de modificação antes de salvar
ClientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Client', ClientSchema);
