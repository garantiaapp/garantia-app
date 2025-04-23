const mongoose = require('mongoose');

const WarrantySchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Por favor, informe o cliente']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Por favor, informe o produto']
  },
  saleDate: {
    type: Date,
    required: [true, 'Por favor, informe a data da venda'],
    default: Date.now
  },
  warrantyEndDate: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Por favor, informe o valor da venda']
  },
  invoiceNumber: {
    type: String
  },
  notes: {
    type: String
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Calcular a data de término da garantia (2 anos a partir da data da venda)
WarrantySchema.pre('save', function(next) {
  if (this.isNew || this.isModified('saleDate')) {
    const saleDate = new Date(this.saleDate);
    this.warrantyEndDate = new Date(saleDate.setFullYear(saleDate.getFullYear() + 2));
  }
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Warranty', WarrantySchema);
